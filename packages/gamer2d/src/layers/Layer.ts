import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";

export class Layer {
	public debugCallback: (() => void) | undefined;

	constructor(
		public gc: GameContext,
		public scene: Scene,
		public name: string,
	) {}

	init(gc: GameContext, scene: Scene) {}
	update(gc: GameContext, scene: Scene) {}
	render(gc: GameContext) {}

	[Symbol.for("inspect")]() {
		return this.name;
	}
}
