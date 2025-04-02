import type GameContext from "../game/GameContext";
import type { Scene } from "../scene/Scene";
import { Layer } from "./Layer";

export class CollisionLayer extends Layer {
	static TASK_REMOVE_ENTITY = Symbol.for("removeEntity");
	static TASK_ADD_ENTITY = Symbol.for("addEntity");

	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(gc: GameContext, parent) {
		super(gc, parent);
	}

	update(gc: GameContext, scene: Scene) {
		// for (const entity of this.entities) entity.update(gc, scene);
		// for (const entity of this.entities) entity.finalize();
	}

	render(gc: GameContext) {
		// for (const entity of this.entities) entity.render(gc);
		// const ctx = gc.viewport.ctx;
		// ctx.fillStyle = "#fff";
		// ctx.font = "10px";
		// // ctx.fillText(`${this.entities.length}`, 600 - 60, 600 - 10);
		// ctx.fillText(`${this.entities.length}`, 500, 15);
	}
}
