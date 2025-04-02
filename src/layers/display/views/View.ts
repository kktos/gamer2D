import type GameContext from "../../../game/GameContext";
import type { ViewContext } from "./views";

export class View {
	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(ctx: ViewContext) {}
	handleEvent(gc: GameContext, e) {}
	destroy() {}
}
