import type { TNeatCommand } from "../compiler2/types/commands.type";
import { executeAlignCommand } from "./commands/align.cmd";
import { executeAnimationCommand } from "./commands/animation.cmd";
import { executeAssignmentCommand } from "./commands/assign.cmd";
import { executeBgColorCommand } from "./commands/bgcolor.cmd";
import { executeCallCommand } from "./commands/call.cmd";
import { executeClearContextCommand } from "./commands/clearcontext.cmd";
import { executeColorCommand } from "./commands/color.cmd";
import { executeFontCommand } from "./commands/font.cmd";
import { executeForCommand } from "./commands/for.cmd";
import { executeImageCommand } from "./commands/image.cmd";
import { executeItemCommand } from "./commands/item.cmd";
import { executeMenuCommand } from "./commands/menu.cmd";
import { executeOnCommand } from "./commands/on.cmd";
import { executePoolCommand } from "./commands/pool.cmd";
import { executeRectCommand } from "./commands/rect.cmd";
import { executeSettingsCommand } from "./commands/settings.cmd";
import { executeSoundCommand } from "./commands/sound.cmd";
import { executeSpriteCommand } from "./commands/sprite.cmd";
import { executeTextCommand } from "./commands/text.cmd";
import { executeTimerCommand } from "./commands/timer.cmd";
import { executeViewCommand } from "./commands/view.cmd";
import { executeZoomCommand } from "./commands/zoom.cmd";
import type { ExecutionContext } from "./exec.type";

// Command executor with metadata
interface CommandExecutor {
	execute: (command: unknown, context: ExecutionContext) => unknown;
}
// Command registry
const COMMAND_REGISTRY = new Map<string, CommandExecutor>();

// Function to register a command
export function addCommand<T extends TNeatCommand>(commandName: string, executor: (command: T, context: ExecutionContext) => void) {
	COMMAND_REGISTRY.set(commandName, {
		execute: executor as (command: unknown, context: ExecutionContext) => unknown,
	});
}

function runCommand<T extends TNeatCommand>(command: T, context: ExecutionContext) {
	const commandExecutor = COMMAND_REGISTRY.get(command.cmd);
	if (!commandExecutor) throw new Error(`Unknown command: ${command.cmd}`);

	return commandExecutor.execute(command, context);
}

export function runCommands(commands: TNeatCommand[], ctx: ExecutionContext) {
	const result: unknown[] = [];

	for (const cmd of commands) {
		const output = runCommand(cmd, ctx);
		if (output !== undefined) {
			if (Array.isArray(output)) result.push(...output);
			else result.push(output);
		}
	}

	return result;
}

addCommand("FONT", executeFontCommand);
addCommand("COLOR", executeColorCommand);
addCommand("BGCOLOR", executeBgColorCommand);
addCommand("ALIGN", executeAlignCommand);
addCommand("ZOOM", executeZoomCommand);
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
addCommand("SOUND", executeSoundCommand);
addCommand("ON", executeOnCommand);
addCommand("TIMER", executeTimerCommand);
addCommand("ITEM", executeItemCommand);
addCommand("CALL", executeCallCommand);
addCommand("CLEARCONTEXT", executeClearContextCommand);
addCommand("SETTINGS", executeSettingsCommand);
