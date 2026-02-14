const POLL_INTERVAL_MS = Number.parseInt(process.env.POLL_INTERVAL_MS ?? '30000', 10);
const RECENT_VIDEOS_LIMIT = Number.parseInt(process.env.RECENT_VIDEOS_LIMIT ?? '5', 10);

const state = {
  offset: 0,
  chatId: process.env.TG_CHAT_ID || '',
  previous: null,
};

const requiredEnv = ['YOUTUBE_API_KEY', 'YOUTUBE_CHANNEL_ID', 'TELEGRAM_BOT_TOKEN'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(Number.parseInt(value ?? '0', 10));

const ytUrl = (path, params) => {
  const qs = new URLSearchParams({ ...params, key: API_KEY });
  return `https://www.googleapis.com/youtube/v3/${path}?${qs.toString()}`;
};

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${response.status}`);
  }
  return data;
}

async function loadStats() {
  const channelPayload = await fetchJson(
    ytUrl('channels', {
      part: 'statistics,contentDetails,snippet',
      id: CHANNEL_ID,
    }),
  );

  const channel = channelPayload?.items?.[0];
  if (!channel) {
    throw new Error('Канал не найден');
  }

  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;
  const uploadsPayload = await fetchJson(
    ytUrl('playlistItems', {
      part: 'contentDetails',
      playlistId: uploadsId,
      maxResults: String(RECENT_VIDEOS_LIMIT),
    }),
  );

  const videoIds = uploadsPayload.items.map((x) => x.contentDetails.videoId).filter(Boolean);

  let videos = [];
  if (videoIds.length) {
    const videosPayload = await fetchJson(
      ytUrl('videos', {
        part: 'statistics,snippet',
        id: videoIds.join(','),
      }),
    );

    const byId = new Map(videosPayload.items.map((x) => [x.id, x]));
    videos = videoIds.map((id) => byId.get(id)).filter(Boolean).map((video) => ({
      id: video.id,
      title: video.snippet.title,
      viewCount: Number.parseInt(video.statistics?.viewCount ?? '0', 10),
      commentCount: Number.parseInt(video.statistics?.commentCount ?? '0', 10),
    }));
  }

  return {
    channelTitle: channel.snippet?.title ?? 'Unknown channel',
    subscribers: Number.parseInt(channel.statistics?.subscriberCount ?? '0', 10),
    views: Number.parseInt(channel.statistics?.viewCount ?? '0', 10),
    videosCount: Number.parseInt(channel.statistics?.videoCount ?? '0', 10),
    videos,
  };
}

function buildSummaryMessage(stats) {
  const lines = [
    `📺 Канал: ${stats.channelTitle}`,
    `👥 Подписчики: ${formatNumber(stats.subscribers)}`,
    `👀 Просмотры: ${formatNumber(stats.views)}`,
    `🎬 Всего роликов: ${formatNumber(stats.videosCount)}`,
    '',
    '🧾 Последние ролики:',
  ];

  if (!stats.videos.length) {
    lines.push('Нет данных по роликам');
  } else {
    for (const video of stats.videos) {
      lines.push(`• ${video.title}`);
      lines.push(`  👀 ${formatNumber(video.viewCount)} | 💬 ${formatNumber(video.commentCount)}`);
    }
  }

  return lines.join('\n');
}

function buildDeltaNotifications(previous, next) {
  if (!previous) return [];

  const notifications = [];
  const subDelta = next.subscribers - previous.subscribers;
  const viewDelta = next.views - previous.views;

  if (subDelta > 0) {
    notifications.push(`🔔 Новые подписки: +${formatNumber(subDelta)} (всего ${formatNumber(next.subscribers)})`);
  }

  if (viewDelta > 0) {
    notifications.push(`📈 Новые просмотры канала: +${formatNumber(viewDelta)} (всего ${formatNumber(next.views)})`);
  }

  const prevVideoById = new Map(previous.videos.map((v) => [v.id, v]));
  for (const video of next.videos) {
    const prev = prevVideoById.get(video.id);
    if (!prev) continue;

    const videoViewDelta = video.viewCount - prev.viewCount;
    const commentDelta = video.commentCount - prev.commentCount;

    if (videoViewDelta > 0) {
      notifications.push(`▶️ ${video.title}\n+${formatNumber(videoViewDelta)} просмотров`);
    }

    if (commentDelta > 0) {
      notifications.push(`💬 ${video.title}\n+${formatNumber(commentDelta)} комментариев`);
    }
  }

  return notifications;
}

async function tgRequest(method, params) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data?.description ?? `Telegram API error (${response.status})`);
  }

  return data.result;
}

async function sendMessage(text) {
  if (!state.chatId) {
    return;
  }

  await tgRequest('sendMessage', {
    chat_id: state.chatId,
    text,
    disable_web_page_preview: true,
  });
}

async function handleUpdates() {
  const result = await tgRequest('getUpdates', {
    timeout: 25,
    offset: state.offset,
    allowed_updates: ['message'],
  });

  for (const update of result) {
    state.offset = update.update_id + 1;
    const text = update.message?.text?.trim() ?? '';
    const chatId = String(update.message?.chat?.id ?? '');

    if (!chatId || !text) {
      continue;
    }

    if (text.startsWith('/start')) {
      state.chatId = chatId;
      await sendMessage('✅ Бот подключен. Команды: /stats, /videos, /channel');
      continue;
    }

    if (text.startsWith('/stats')) {
      state.chatId = chatId;
      const stats = await loadStats();
      await sendMessage(buildSummaryMessage(stats));
      continue;
    }

    if (text.startsWith('/videos')) {
      state.chatId = chatId;
      const stats = await loadStats();
      const textMessage = stats.videos.length
        ? stats.videos
            .map((v) => `🎬 ${v.title}\n👀 ${formatNumber(v.viewCount)} | 💬 ${formatNumber(v.commentCount)}`)
            .join('\n\n')
        : 'Нет данных по роликам';
      await sendMessage(textMessage);
      continue;
    }

    if (text.startsWith('/channel')) {
      state.chatId = chatId;
      await sendMessage(`Текущий канал: ${CHANNEL_ID}`);
      continue;
    }
  }
}

async function monitorLoop() {
  try {
    const nextStats = await loadStats();
    const notifications = buildDeltaNotifications(state.previous, nextStats);

    for (const note of notifications) {
      await sendMessage(note);
    }

    state.previous = nextStats;
  } catch (error) {
    console.error('Monitor error:', error.message);
  }
}

async function main() {
  console.log('Bot started. Waiting for /start in Telegram chat...');
  await monitorLoop();

  setInterval(async () => {
    await monitorLoop();
  }, POLL_INTERVAL_MS);

  while (true) {
    try {
      await handleUpdates();
    } catch (error) {
      console.error('Updates error:', error.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

main();
