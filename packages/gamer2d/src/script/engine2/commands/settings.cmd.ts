import type { TNeatSettingsCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeSettingsCommand(command: TNeatSettingsCommand, _: ExecutionContext) {
	return { type: "SETTINGS", value: command.value };
}
