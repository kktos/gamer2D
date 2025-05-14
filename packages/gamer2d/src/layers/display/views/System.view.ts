import type { Entity } from "../../../entities/Entity";
import { createEntityByName } from "../../../entities/Entity.factory";
import { EntityPool } from "../../../entities/EntityPool";
import type { GameContext } from "../../../game/types/GameContext";
import type { TText } from "../../../script/compiler/layers/display/layout/text.rules";
import type { TVarSounds } from "../../../types/engine.types";
import LocalDB from "../../../utils/storage.util";
import type { TVars } from "../../../utils/vars.utils";
import type { DisplayLayer } from "../../display.layer";
import { EntitiesLayer } from "../../entities.layer";

export class System {
	private gc: GameContext;
	private vars: TVars;
	private layer: DisplayLayer;

	constructor({ gc, vars, layer }) {
		this.gc = gc;
		this.vars = vars;
		this.layer = layer;

		this.vars.set("SYSTEM", this);

		const EntityPoolStub = {
			create: (id: string, name: string, size: number, ...args: unknown[]) => {
				const pool = EntityPool.create(gc.resourceManager, id, name, size, ...args);
				this.layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, pool);
				return pool;
			},
		};

		this.vars.set("EntityPool", EntityPoolStub);
	}

	EntityPool(id: string) {
		return EntityPool.pools[id];
	}

	entities(name: string) {
		let entity: Entity | undefined;
		this.layer.scene.useLayer("EntitiesLayer", (layer: EntitiesLayer) => {
			entity = layer.get(name);
		});
		return entity;
	}

	goto(sceneName: string) {
		this.gc.scene?.goto(sceneName);
	}

	updateHighscores(playerName: string) {
		if (playerName) {
			LocalDB.updateName(playerName);
			LocalDB.updateHighscores();
		}
	}

	concat(str: string, maxLen: number) {
		let value = this.vars.get(str) as string;
		const text = (this.vars.get("itemSelected") as TText).text;
		if (maxLen) {
			if (value.length >= maxLen) value = "";
			value += text;
			value = value.substring(0, maxLen);
		} else value += text;
		this.vars.set(str, value);
	}

	spawn(name: string, ...args: unknown[]) {
		const entity = createEntityByName(this.gc.resourceManager, name, ...args);
		this.layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
	}

	timer(name: string) {
		return this.layer.timers?.get(name);
	}

	sprite(id: string) {
		return (this.vars.get("sprites") as Map<string, Entity>).get(id);
	}

	sound(name: string) {
		return (this.vars.get("sounds") as TVarSounds).get(name);
	}

	log(...args) {
		console.log(...args);
		return this;
	}
}
