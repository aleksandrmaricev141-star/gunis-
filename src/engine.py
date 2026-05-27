from __future__ import annotations

import pygame
from dataclasses import dataclass
from typing import Callable


@dataclass
class Scene:
    update: Callable[[float], None]
    draw: Callable[[pygame.Surface], None]
    handle_event: Callable[[pygame.event.Event], None]


class GameEngine:
    """Мини-движок для 2D-стратегии: окно, цикл, тайминг, сцена."""

    def __init__(self, width: int = 1280, height: int = 720, title: str = "Орловская область: стратегия") -> None:
        pygame.init()
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption(title)
        self.clock = pygame.time.Clock()
        self.running = True
        self.scene: Scene | None = None

    def set_scene(self, scene: Scene) -> None:
        self.scene = scene

    def run(self) -> None:
        if self.scene is None:
            raise RuntimeError("Scene is not set")

        while self.running:
            dt = self.clock.tick(60) / 1000.0
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    break
                self.scene.handle_event(event)

            self.scene.update(dt)
            self.scene.draw(self.screen)
            pygame.display.flip()

        pygame.quit()
