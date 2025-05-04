import type GameContext from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import { GLOBAL_VARIABLES } from "../scene/Scene.factory";
import type { TGlobalsLayerSheet } from "../script/compiler/layers/globals/globals.rules";
import { execSet } from "../script/engine/exec.script";
import { TVars } from "../utils/vars.utils";
import { Layer } from "./Layer";

const EMPTY_OBJECT: Record<string, unknown> = {};

export class GlobalsLayer extends Layer {
	constructor(gc: GameContext, parent: Scene, sheet: TGlobalsLayerSheet) {
		super(gc, parent);

		const vars = new TVars(GLOBAL_VARIABLES, GLOBAL_VARIABLES);
		for (const variable of sheet.variables) {
			const [name, ...parms] = variable.name.split(".");
			if (parms.length) vars.set(name, EMPTY_OBJECT);
			execSet({ vars }, variable);
		}
	}
}
