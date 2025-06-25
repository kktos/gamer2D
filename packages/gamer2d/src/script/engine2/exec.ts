import type { TNeatCommand } from "../compiler2/types/commands.type";
import { executeAlignCommand } from "./commands/align.cmd";
import { executeAnimationCommand } from "./commands/animation.cmd";
import { executeAssignmentCommand } from "./commands/assign.cmd";
import { executeColorCommand } from "./commands/color.cmd";
import { executeFontCommand } from "./commands/font.cmd";
import { executeForCommand } from "./commands/for.cmd";
import { executeImageCommand } from "./commands/image.cmd";
import { executeItemCommand } from "./commands/item.cmd";
import { executeMenuCommand } from "./commands/menu.cmd";
import { executeOnCommand } from "./commands/on.cmd";
import { executePoolCommand } from "./commands/pool.cmd";
import { executeRectCommand } from "./commands/rect.cmd";
import { executeSpriteCommand } from "./commands/sprite.cmd";
import { executeTextCommand } from "./commands/text.cmd";
import { executeViewCommand } from "./commands/view.cmd";
import type { ExecutionContext } from "./exec.type";

// Command executor with metadata
interface CommandExecutor {
	execute: (command: unknown, context: ExecutionContext) => void;
}
// Command registry
const COMMAND_REGISTRY = new Map<string, CommandExecutor>();

// Function to register a command
export function addCommand<T extends TNeatCommand>(
	commandName: string,
	executor: (command: T, context: ExecutionContext) => void,
) {
	COMMAND_REGISTRY.set(commandName, {
		execute: executor as (command: unknown, context: ExecutionContext) => void,
	});
}

function runCommand<T extends TNeatCommand>(
	command: T,
	context: ExecutionContext,
) {
	const commandExecutor = COMMAND_REGISTRY.get(command.cmd);
	if (!commandExecutor) throw new Error(`Unknown command: ${command.cmd}`);

	return commandExecutor.execute(command, context);
}

export function runCommands(
	commands: TNeatCommand[],
	ctx: ExecutionContext,
): TNeatCommand[] {
	const result: TNeatCommand[] = [];

	for (const cmd of commands) {
		const output = runCommand(cmd, ctx) as
			| TNeatCommand[]
			| TNeatCommand
			| undefined;
		if (output !== undefined) {
			if (Array.isArray(output)) result.push(...output);
			else result.push(output);
		}
	}

	return result;
}

addCommand("FONT", executeFontCommand);
addCommand("COLOR", executeColorCommand);
addCommand("ALIGN", executeAlignCommand);
addCommand("TEXT", executeTextCommand);
addCommand("SPRITE", executeSpriteCommand);
addCommand("RECT", executeRectCommand);
addCommand("VIEW", executeViewCommand);
addCommand("ASSIGN", executeAssignmentCommand);
addCommand("FOR", executeForCommand);
addCommand("ANIMATION", executeAnimationCommand);
addCommand("IMAGE", executeImageCommand);
addCommand("MENU", executeMenuCommand);
addCommand("POOL", executePoolCommand);
addCommand("ON", executeOnCommand);
addCommand("ITEM", executeItemCommand);
