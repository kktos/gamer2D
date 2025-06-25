import { GLOBAL_VARIABLES } from "../game";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { TSet } from "../script/compiler/layers/display/layout/set.rules";
import { runCommands } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.type";
import type { TNeatFunctions } from "../utils/functionDict.utils";
import { TVars } from "../utils/vars.utils";
import { Layer } from "./Layer";

const _EMPTY_OBJECT: Record<string, unknown> = {};

class VarSetDict extends Map<string, TSet> {
	[Symbol.for("inspect")]() {
		const result = document.createElement("ul");
		let html = "";
		for (const [name, varValue] of this.entries()) {
			const value = varValue.value;
			const displayValue = value[Symbol.for("inspect")]
				? value[Symbol.for("inspect")]()
				: value;
			html += `<li>${name}: ${displayValue}</li>`;
		}
		result.innerHTML = html;
		return result;
	}
}

export class GlobalsLayer extends Layer {
	private varDict = new VarSetDict();

	constructor(gc: GameContext, parent: Scene, sheet) {
		super(gc, parent, "globals");

		const variables: TVars = new TVars(GLOBAL_VARIABLES, GLOBAL_VARIABLES);
		const context: ExecutionContext = {
			variables,
			functions: null as unknown as TNeatFunctions,
		};

		runCommands(sheet.data, context);

		// const vars = new TVars(GLOBAL_VARIABLES, GLOBAL_VARIABLES);
		// for (const variable of sheet.variables) {
		// 	const [name, ...parms] = variable.name.split(".");
		// 	if (parms.length) vars.set(name, EMPTY_OBJECT);
		// 	execSet({ vars }, variable);
		// 	this.varDict.set(name, variable);
		// }
	}
}
