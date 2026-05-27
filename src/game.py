from __future__ import annotations

from dataclasses import dataclass, field
import pygame


@dataclass
class CareerState:
    rank: str = "Глава района"
    controlled_districts: int = 1
    merit_points: int = 0
    log: list[str] = field(default_factory=list)


class OrelStrategyGame:
    def __init__(self) -> None:
        self.state = CareerState(log=["Вы начали как глава района."])
        self.font = pygame.font.SysFont("segoeui", 24)
        self.small_font = pygame.font.SysFont("segoeui", 20)
        self.map_surface = self._build_contour_map()

    def _build_contour_map(self) -> pygame.Surface:
        surf = pygame.Surface((600, 520), pygame.SRCALPHA)
        # Упрощённая контурная карта области (стартовая заглушка)
        points = [
            (140, 80), (240, 50), (360, 65), (450, 120), (520, 220),
            (500, 360), (390, 460), (240, 490), (120, 430), (70, 290), (90, 170)
        ]
        pygame.draw.polygon(surf, (22, 40, 52), points)
        pygame.draw.polygon(surf, (176, 224, 212), points, width=3)

        # 3 игровых района внутри
        pygame.draw.line(surf, (130, 180, 170), (220, 80), (200, 460), 2)
        pygame.draw.line(surf, (130, 180, 170), (330, 70), (320, 470), 2)
        return surf

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                self.complete_merit_action()
            if event.key == pygame.K_n:
                self.try_take_new_district()
            if event.key == pygame.K_r:
                self.try_promote_rank()

    def complete_merit_action(self) -> None:
        self.state.merit_points += 1
        self.state.log.append("Заслуга получена (+1 очко).")

    def try_take_new_district(self) -> None:
        if self.state.controlled_districts >= 3:
            self.state.log.append("Лимит: максимум 3 района.")
            return
        cost = 3 * self.state.controlled_districts
        if self.state.merit_points >= cost:
            self.state.merit_points -= cost
            self.state.controlled_districts += 1
            self.state.log.append(f"Под контроль взят район №{self.state.controlled_districts}.")
        else:
            self.state.log.append(f"Нужно {cost} очков заслуг.")

    def try_promote_rank(self) -> None:
        if self.state.rank == "Глава района" and self.state.controlled_districts >= 3 and self.state.merit_points >= 4:
            self.state.rank = "Мэр города Орёл"
            self.state.merit_points -= 4
            self.state.log.append("Вы стали мэром города Орёл!")
            return

        if self.state.rank == "Мэр города Орёл" and self.state.merit_points >= 8:
            self.state.rank = "Губернатор Орловской области"
            self.state.merit_points -= 8
            self.state.log.append("Максимальный ранг достигнут: Губернатор области!")
            return

        self.state.log.append("Пока нельзя повыситься.")

    def update(self, _dt: float) -> None:
        if len(self.state.log) > 8:
            self.state.log = self.state.log[-8:]

    def draw(self, screen: pygame.Surface) -> None:
        screen.fill((10, 14, 18))

        title = self.font.render("Контурная стратегия: Орловская область", True, (235, 246, 245))
        screen.blit(title, (30, 20))
        screen.blit(self.map_surface, (40, 110))

        panel_x = 700
        info = [
            f"Должность: {self.state.rank}",
            f"Районов в подчинении: {self.state.controlled_districts}/3",
            f"Очки заслуг: {self.state.merit_points}",
            "",
            "Управление:",
            "SPACE — получить заслугу",
            "N — взять район",
            "R — повыситься",
        ]
        y = 120
        for line in info:
            color = (211, 230, 226) if line else (0, 0, 0)
            text = self.small_font.render(line, True, color)
            screen.blit(text, (panel_x, y))
            y += 34

        y = 430
        log_title = self.small_font.render("События:", True, (242, 251, 250))
        screen.blit(log_title, (panel_x, y))
        y += 30
        for entry in reversed(self.state.log):
            text = self.small_font.render(f"• {entry}", True, (185, 208, 203))
            screen.blit(text, (panel_x, y))
            y += 28
