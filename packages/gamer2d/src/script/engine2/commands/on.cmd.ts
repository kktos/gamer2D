import type { TNeatOnCommand } from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.context";

export function executeOnCommand(command: TNeatOnCommand, context: ExecutionContext) {
	context.currentScene?.on(Symbol.for(command.event), (...args) => {
		if (command.from && args.shift() !== command.from) return;

		for (let idx = 0; idx < command.params.length; idx++) context.variables.set(command.params[idx], args[idx]);

		runCommands(command.statements, context);
	});
}
