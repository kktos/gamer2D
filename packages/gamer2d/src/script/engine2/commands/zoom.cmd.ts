import type { TNeatZoomCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";
import { evalExpressionAs } from "../expr.eval";

export function executeZoomCommand(command: TNeatZoomCommand, context: ExecutionContext) {
	context.currentZoom = evalExpressionAs(command.value, context, "number");
}
