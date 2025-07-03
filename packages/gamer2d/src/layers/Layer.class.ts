import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";

export class Layer {
	public debugCallback: (() => void) | undefined;

	constructor(
		public gc: GameContext,
		public scene: Scene,
		public name: string,
	) {}

	init(_gc: GameContext, _scene: Scene) {}
	update(_gc: GameContext, _scene: Scene) {}
	render(_gc: GameContext) {}

	[Symbol.for("inspect")]() {
		return this.name;
	}
}
