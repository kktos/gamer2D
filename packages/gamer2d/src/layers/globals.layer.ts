import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { TSet } from "../script/compiler/layers/display/layout/set.rules";
import { runCommands } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.type";
import type { NeatFunctions } from "../script/engine2/functions/functionDict.utils";
import { createVariableStore } from "../utils/vars.store";
import { Layer } from "./Layer";

class VarSetDict extends Map<string, TSet> {
	[Symbol.for("inspect")]() {
		const result = document.createElement("ul");
		let html = "";
		for (const [name, varValue] of this.entries()) {
			const value = varValue.value;
			const displayValue = value[Symbol.for("inspect")] ? value[Symbol.for("inspect")]() : value;
			html += `<li>${name}: ${displayValue}</li>`;
		}
		result.innerHTML = html;
		return result;
	}
}

export class GlobalsLayer extends Layer {
	constructor(gc: GameContext, parent: Scene, sheet) {
		super(gc, parent, "globals");

		const context: ExecutionContext = {
			variables: createVariableStore(true),
			functions: null as unknown as NeatFunctions,
		};

		// make sure the system var is set; usually done once at startup
		if (!context.variables.has("system")) {
			context.variables.setGlobal("system", {
				screen: {
					width: gc.viewport.width,
					height: gc.viewport.height,
				},
			});
		}

		runCommands(sheet.data, context);
	}
}
