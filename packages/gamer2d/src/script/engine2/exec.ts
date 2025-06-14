import type { TNeatCommand } from "../compiler2/types/commands.type";
import { executeAlignCommand } from "./commands/align.cmd";
import { executeAnimationCommand } from "./commands/animation.cmd";
import { executeAssignmentCommand } from "./commands/assign.cmd";
import { executeColorCommand } from "./commands/color.cmd";
import { executeFontCommand } from "./commands/font.cmd";
import { executeForCommand } from "./commands/for.cmd";
import { executeImageCommand } from "./commands/image.cmd";
import { executeMenuCommand } from "./commands/menu.cmd";
import { executeOnCommand } from "./commands/on.cmd";
import { executePoolCommand } from "./commands/pool.cmd";
import { executeRectCommand } from "./commands/rect.cmd";
import { executeSpriteCommand } from "./commands/sprite.cmd";
import { executeTextCommand } from "./commands/text.cmd";
import { executeViewCommand } from "./commands/view.cmd";
import type { ExecutionContext } from "./exec.type";

// Command execution handlers
const COMMAND_EXECUTORS = {
	FONT: executeFontCommand,
	COLOR: executeColorCommand,
	ALIGN: executeAlignCommand,
	TEXT: executeTextCommand,
	SPRITE: executeSpriteCommand,
	RECT: executeRectCommand,
	VIEW: executeViewCommand,
	ASSIGN: executeAssignmentCommand,
	FOR: executeForCommand,
	ANIMATION: executeAnimationCommand,
	IMAGE: executeImageCommand,
	MENU: executeMenuCommand,
	POOL: executePoolCommand,
	ON: executeOnCommand,
} as const;

function executeCommand<T extends TNeatCommand>(command: T, context: ExecutionContext) {
	const executor = COMMAND_EXECUTORS[command.cmd];
	if (!executor) {
		throw new Error(`Unknown command: ${command.cmd}`);
	}
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	(executor as any)(command, context);
}

// Main execution function - cleaner version
export function executeLayerUI(commands: TNeatCommand[], context: ExecutionContext) {
	for (const command of commands) {
		executeCommand(command, context);
	}
}
