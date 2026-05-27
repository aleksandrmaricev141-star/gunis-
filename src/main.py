from engine import GameEngine, Scene
from game import OrelStrategyGame


def main() -> None:
    game = OrelStrategyGame()
    engine = GameEngine()
    engine.set_scene(Scene(update=game.update, draw=game.draw, handle_event=game.handle_event))
    engine.run()


if __name__ == "__main__":
    main()
