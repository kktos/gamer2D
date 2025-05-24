import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";

export class Layer {
	public gc: GameContext;
	public scene: Scene;
	public debugCallback: (() => void) | undefined;

	constructor(gc: GameContext, parent: Scene) {
		this.gc = gc;
		this.scene = parent;
	}

	init(gc: GameContext, scene: Scene) {}
	update(gc: GameContext, scene: Scene) {}
	render(gc: GameContext) {}
}
