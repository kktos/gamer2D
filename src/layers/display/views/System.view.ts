import { EntityPool } from "../../../entities/EntityPool";
import { entityClasses } from "../../../entities/entities";
import type GameContext from "../../../game/GameContext";
import { Scene } from "../../../scene/Scene";
import type { TText } from "../../../script/compiler/display/layout/text.rules";
import type { TVarSounds, TVarSprites, TVars } from "../../../types/engine.types";
import LocalDB from "../../../utils/storage.util";
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

		this.vars.set("EntityPool", {
			create: (name: string, size: number, ...args: unknown[]) => {
				const pool = EntityPool.create(gc.resourceManager, name, size, ...args);
				this.layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, pool);
			},
			spawn: (name: string, ...args: unknown[]) => {
				EntityPool.pools[name].get();
			},
		});
	}

	goto(sceneName: string) {
		this.gc.scene?.events.emit(Scene.EVENT_COMPLETE, sceneName);
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
		if (entityClasses[name]) {
			const entity = new entityClasses[name](this.gc.resourceManager, ...args);
			this.layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
		}
	}

	timer(name: string) {
		return this.layer.timers?.get(name);
	}

	sprite(idx: number) {
		return (this.vars.get("sprites") as TVarSprites).get(idx);
	}

	sound(name: string) {
		return (this.vars.get("sounds") as TVarSounds).get(name);
	}
}
