import type { Entity } from "../entities/Entity";
import type GameContext from "../game/GameContext";
import { BackgroundLayer } from "../layers/background.layer";
import { CollisionLayer } from "../layers/collision.layer";
import { DashboardLayer } from "../layers/dashboard.layer";
import { EntitiesLayer } from "../layers/entities.layer";
import { LevelLayer } from "../layers/level.layer";
import type { Grid } from "../maths/grid.math";
import type { ArgColor } from "../types/value.types";
import { createLevelEntities } from "../utils/createLevelEntities.utils";
import { createLevelGrid } from "../utils/createLevelGrid.utils";
import { Scene } from "./Scene";

export type SceneLevelSheet = {
	type: "level";
	name: string;
	showCursor?: boolean;
	background?: ArgColor;
	font?: string;
	settings?: Record<string, unknown>;
	sprites?: unknown[];
};

export default class LevelScene extends Scene {
	static TASK_ADD_ENTITY = Symbol.for("add entity");

	static STATE_STARTING = Symbol.for("starting");
	static STATE_RUNNING = Symbol.for("running");
	static STATE_ENDING = Symbol.for("ending");

	public gravity: number;
	public grid: Grid;

	private state: symbol;
	private entities: Entity[];

	constructor(gc: GameContext, name: string, sheet: SceneLevelSheet) {
		super(gc, name, sheet.settings);

		this.isPermanent = false;

		// this.entities = [];

		// this.audio= gc.resourceManager.get("audio","level");
		this.state = LevelScene.STATE_STARTING;

		this.gravity = 50;

		this.grid = createLevelGrid(sheet.settings);

		this.entities = createLevelEntities(gc.resourceManager, this.grid, sheet.sprites);

		// const spawner= new SpawnerEntity(gc.resourceManager, 300, 550);
		// this.entities.push(spawner);

		this.addLayer(new BackgroundLayer(gc, this, sheet.background?.value));
		this.addLayer(new LevelLayer(gc, this, sheet.name, sheet.settings, this.grid));
		this.addLayer(new EntitiesLayer(gc, this, this.entities, sheet));
		this.addLayer(new CollisionLayer(gc, this));
		this.addLayer(new DashboardLayer(gc, this));
	}

	init(gc: GameContext) {
		return this;
	}

	broadcast(name: symbol, ...args: unknown[]) {
		for (let idx = 0; idx < this.entities.length; idx++) {
			this.entities[idx].emit(name, ...args);
		}
	}

	// collides(gc, target) {
	// 	for (let idx = 0; idx < this.entities.length; idx++) {
	// 		const entity= this.entities[idx];

	// 		if(target === entity)
	// 			continue;

	// 		// if(target.class === "BallEntity")
	// 		// 	console.log("Level.collides", this.entities.length, idx, entity.class, entity.size, target.size);

	// 		if(!(entity.size.x + entity.size.y) || !(target.size.x + target.size.y))
	// 			continue;

	// 		let side= collideRect(entity, target);

	// 		if(side !== COLLISION.NONE) {
	// 			target.collides(gc, side, entity);
	// 			if(!entity.isFixed)
	// 				continue;
	// 			switch(side) {
	// 				case COLLISION.LEFT:
	// 					side= COLLISION.RIGHT;
	// 					break;

	// 				case COLLISION.RIGHT:
	// 					side= COLLISION.LEFT;
	// 					break;

	// 				case COLLISION.TOP:
	// 					side= COLLISION.BOTTOM;
	// 					break;

	// 				case COLLISION.BOTTOM:
	// 					side= COLLISION.TOP;
	// 					break;
	// 			}
	// 			entity.collides(gc, side, target);
	// 		}
	// 	}

	// }

	// update(gc) {
	// 	super.update(gc);

	// 	for (const entity of this.entities)
	// 		entity.finalize();

	// }

	handleEvent(gc: GameContext, e) {
		// switch(e.type) {
		// 	case "keydown": {
		// 		switch(e.key) {
		// 			case "r":
		// 				this.reset(gc);
		// 				break;
		// 			case "n":
		// 				this.events.emit(Scene.EVENT_COMPLETE, -1);
		// 				break;
		// 		}
		// 		break;
		// 	}
		// 	case "click": {
		// 		this.paddle.emit(Events.EVENT_MOUSECLICK, gc, this.paddle.pos);
		// 		break;
		// 	}
		// }
	}
}
