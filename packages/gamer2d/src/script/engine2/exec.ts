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

// Command metadata interface
interface CommandMetadata {
	needsPreparation?: boolean;
	needsRendering?: boolean;
}

// Command executor with metadata
interface CommandExecutor {
	execute: (command: unknown, context: ExecutionContext) => void;
	metadata: CommandMetadata;
}
// Command registry
const COMMAND_REGISTRY = new Map<string, CommandExecutor>();

// Function to register a command
export function addCommand<T extends TNeatCommand>(
	commandName: string,
	executor: (command: T, context: ExecutionContext) => void,
	metadata: CommandMetadata = {},
) {
	COMMAND_REGISTRY.set(commandName, {
		execute: executor as (command: unknown, context: ExecutionContext) => void,
		metadata,
	});
}

// Function to check if command needs preparation
export function commandNeedsPreparation(commandName: string): boolean {
	const commandExecutor = COMMAND_REGISTRY.get(commandName);
	if (!commandExecutor) throw new Error(`Unknown command: ${commandName}`);
	return commandExecutor.metadata.needsPreparation ?? false;
}

// Function to check if command needs rendering
export function commandNeedsRendering(commandName: string): boolean {
	const commandExecutor = COMMAND_REGISTRY.get(commandName);
	if (!commandExecutor) throw new Error(`Unknown command: ${commandName}`);
	return commandExecutor.metadata.needsRendering ?? false;
}

function executeCommand<T extends TNeatCommand>(command: T, context: ExecutionContext) {
	const commandExecutor = COMMAND_REGISTRY.get(command.cmd);
	if (!commandExecutor) throw new Error(`Unknown command: ${command.cmd}`);

	return commandExecutor.execute(command, context);
}

export function runPreparationPhase(commands: TNeatCommand[], ctx: ExecutionContext): TNeatCommand[] {
	const result: TNeatCommand[] = [];

	for (const cmd of commands) {
		if (!commandNeedsPreparation(cmd.cmd)) {
			if (commandNeedsRendering(cmd.cmd)) {
				result.push(cmd);
			}
			continue;
		}

		const output = executeCommand(cmd, ctx) as TNeatCommand[] | TNeatCommand | undefined;
		if (output !== undefined) {
			if (Array.isArray(output)) result.push(...output);
			else result.push(output);
		}
	}

	return result;
}

export function runRenderingPhase(commands: TNeatCommand[], ctx: ExecutionContext): void {
	for (const cmd of commands) {
		if (!commandNeedsRendering(cmd.cmd)) throw new Error(`Command cant be rendered: ${cmd.cmd}`);

		executeCommand(cmd, ctx);
	}
}

addCommand("FONT", executeFontCommand, { needsPreparation: true });
addCommand("COLOR", executeColorCommand, { needsPreparation: true });
addCommand("ALIGN", executeAlignCommand, { needsPreparation: true });
addCommand("TEXT", executeTextCommand, { needsPreparation: true });
addCommand("SPRITE", executeSpriteCommand, { needsPreparation: true });
addCommand("RECT", executeRectCommand, { needsRendering: true });
addCommand("VIEW", executeViewCommand, { needsPreparation: true, needsRendering: true });
addCommand("ASSIGN", executeAssignmentCommand, { needsPreparation: true });
addCommand("FOR", executeForCommand, { needsPreparation: true });
addCommand("ANIMATION", executeAnimationCommand, { needsPreparation: true });
addCommand("IMAGE", executeImageCommand, { needsRendering: true });
addCommand("MENU", executeMenuCommand, { needsPreparation: true, needsRendering: true });
addCommand("POOL", executePoolCommand, { needsPreparation: true });
addCommand("ON", executeOnCommand, { needsPreparation: true });
addCommand("ITEM", executeItemCommand, { needsPreparation: true });
