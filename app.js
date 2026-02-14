const form = document.getElementById('counter-form');
const statusEl = document.getElementById('status');
const subscribersEl = document.getElementById('subscribers');
const viewsEl = document.getElementById('views');
const videosCountEl = document.getElementById('videos-count');
const videosTableBodyEl = document.getElementById('videos-table-body');

const POLLING_INTERVAL_MS = 10_000;
const RECENT_VIDEOS_LIMIT = 5;
let pollingHandle = null;

const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(Number.parseInt(value ?? '0', 10));

const apiUrl = (path, params) => {
  const urlParams = new URLSearchParams(params);
  return `https://www.googleapis.com/youtube/v3/${path}?${urlParams.toString()}`;
};

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message ?? 'Ошибка запроса к YouTube API.';
    throw new Error(message);
  }

  return payload;
}

function renderVideos(videos) {
  if (!videos.length) {
    videosTableBodyEl.innerHTML = '<tr><td colspan="3">Нет данных</td></tr>';
    return;
  }

  videosTableBodyEl.innerHTML = videos
    .map(
      (video) => `
      <tr>
        <td><a href="https://youtu.be/${video.id}" target="_blank" rel="noreferrer">${video.title}</a></td>
        <td>${formatNumber(video.viewCount)}</td>
        <td>${formatNumber(video.commentCount)}</td>
      </tr>
    `,
    )
    .join('');
}

async function fetchDashboardData(apiKey, channelId) {
  const channelData = await fetchJson(
    apiUrl('channels', {
      part: 'statistics,contentDetails',
      id: channelId,
      key: apiKey,
    }),
  );

  const channel = channelData?.items?.[0];
  if (!channel) {
    throw new Error('Канал не найден. Проверьте Channel ID.');
  }

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  const playlistData = await fetchJson(
    apiUrl('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: String(RECENT_VIDEOS_LIMIT),
      key: apiKey,
    }),
  );

  const videoIds = playlistData.items
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);

  let videos = [];
  if (videoIds.length) {
    const videosData = await fetchJson(
      apiUrl('videos', {
        part: 'statistics,snippet',
        id: videoIds.join(','),
        key: apiKey,
      }),
    );

    const byId = new Map(videosData.items.map((item) => [item.id, item]));

    videos = videoIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((video) => ({
        id: video.id,
        title: video.snippet?.title ?? 'Без названия',
        viewCount: video.statistics?.viewCount ?? '0',
        commentCount: video.statistics?.commentCount ?? '0',
      }));
  }

  subscribersEl.textContent = formatNumber(channel.statistics?.subscriberCount ?? '0');
  viewsEl.textContent = formatNumber(channel.statistics?.viewCount ?? '0');
  videosCountEl.textContent = formatNumber(channel.statistics?.videoCount ?? '0');
  renderVideos(videos);

  statusEl.classList.remove('error');
  statusEl.textContent = `Обновлено: ${new Date().toLocaleTimeString('ru-RU')}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const apiKey = document.getElementById('api-key').value.trim();
  const channelId = document.getElementById('channel-id').value.trim();

  if (!apiKey || !channelId) {
    return;
  }

  if (pollingHandle) {
    clearInterval(pollingHandle);
  }

  const run = async () => {
    try {
      await fetchDashboardData(apiKey, channelId);
    } catch (error) {
      statusEl.classList.add('error');
      statusEl.textContent = `Ошибка: ${error.message}`;
    }
  };

  await run();
  pollingHandle = setInterval(run, POLLING_INTERVAL_MS);
});
