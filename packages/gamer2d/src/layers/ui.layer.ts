import type { Entity } from "../entities/Entity";
import { Font } from "../game/Font";
import type { GameContext } from "../game/types/GameContext";
import type { BaseEvent, KeyEvent } from "../game/types/GameEvent";
import type { Scene } from "../scenes/Scene";
import type { TNeatCommand } from "../script/compiler2/types/commands.type";
import { runCommands } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.context";
import { functions } from "../script/engine2/functions/functions.store";
import type { ArgVariable, OP_TYPES, TupleToUnion } from "../types";
import type { BBox } from "../utils/maths/BBox.class";
import { createVariableStore, type NeatVariableStore } from "../utils/vars.store";
import type { View } from "./display/views/View";
import { HTMLLayer } from "./HTMLLayer";

type TView = {
	type: TupleToUnion<[typeof OP_TYPES.VIEW]>;
	id: string;
	view: string;
	pos: [number, number];
	width: number | ArgVariable;
	height: number | ArgVariable;
};

type TViewDef = TView & {
	component?: View;
	canvas?: HTMLCanvasElement;
	bbox?: BBox;
};

export class UiLayer extends HTMLLayer {
	public font: Font;
	public variables: NeatVariableStore;

	private layout: TNeatCommand[];

	// private lastJoyTime: number;
	private views: TViewDef[];

	constructor(gc: GameContext, parent: Scene, sheet) {
		super(gc, parent, "ui", sheet.ui);

		this.font = Font.get(sheet.font);

		this.layout = sheet.data;
		// this.lastJoyTime = 0;

		this.variables = createVariableStore();
		this.initVars();
		// EntityPool.clear();

		// this.views = this.layout.filter((op) => op.type === OP_TYPES.VIEW) as unknown as TViewDef[];
		// initViews({ canvas: gc.viewport.canvas, gc, vars: this.vars, layer: this });
		this.views = [];

		this.prepareRendering(gc);

		// if (sheet.sounds) this.vars.set("sounds", initSounds({ soundDefs: sheet.sounds, parent, resourceManager: rezMgr }));
	}

	destroy() {
		if (this.views)
			for (let idx = 0; idx < this.views.length; idx++) {
				const view = this.views[idx];
				view.component?.destroy();
			}
	}

	initVars() {
		this.variables.setBatch(
			{
				mouseX: 0,
				mouseY: 0,
				sprites: new Map<string, Entity>(),
			},
			"global",
		);
	}

	prepareRendering(gc: GameContext) {
		const context: ExecutionContext = {
			variables: this.variables,
			functions: functions,
			gc,
			currentScene: this.scene,
			currentOrigin: [
				{
					x: 0,
					y: 0,
				},
			],
		};

		runCommands(this.layout, context);

		// const views = this.layout.filter((op) => op.type === OP_TYPES.VIEW);
		// for (const view of views) this.vars.set(view.id, 0);

		// for (let idx = 0; idx < this.layout.length; idx++) {
		// 	const op = this.layout[idx];
		// 	switch (op.type) {
		// 		case OP_TYPES.VIEW:
		// 			this.prepareView(gc, op);
		// 			break;
		// 	}
		// }
	}

	prepareView(_gc: GameContext, _viewDeff: TViewDef) {
		// if (!viewClasses[viewDef.view]) throw new TypeError(`Unknown View Type ${viewDef.view}`);
		// const width = evalNumberValue({ vars: this.variables }, viewDef.width);
		// const height = evalNumberValue({ vars: this.variables }, viewDef.height);
		// const left = evalNumberValue({ vars: this.variables }, viewDef.pos[0]);
		// const top = evalNumberValue({ vars: this.variables }, viewDef.pos[1]);
		// const canvas = document.createElement("canvas");
		// canvas.width = width;
		// canvas.height = height;
		// const ctx = { canvas, gc, vars: this.variables, layer: this };
		// viewDef.component = new viewClasses[viewDef.view](ctx);
		// viewDef.canvas = canvas;
		// viewDef.bbox = new BBox(left, top, width, height);
		// this.variables.set(viewDef.id, viewDef.component || 0);
	}

	handleEvent(gc: GameContext, e: BaseEvent) {
		gc.viewport.canvas.style.cursor = "default";

		switch (e.type) {
			// case "joyaxismove":
			// 	if(e.timestamp - this.lastJoyTime < 200)
			// 		return;
			// 	this.lastJoyTime= e.timestamp;
			// 	if(e.vertical < -0.1)
			// 		return this.menuMoveUp();
			// 	if(e.vertical > 0.1)
			// 		return this.menuMoveDown();

			case "mousemove":
				this.variables.setGlobal("mouseX", e.x);
				this.variables.setGlobal("mouseY", e.y);
				break;
		}

		// if (this.menu?.handleEvent(e)) return;

		for (let idx = 0; idx < this.views.length; idx++) {
			const view = this.views[idx];

			if ("x" in e && !["keyup", "keydown"].includes(e.type)) if (!view.bbox?.isPointInside(e.x, e.y)) continue;

			e.x = gc.mouse.x - (view.bbox?.left ?? 0);
			e.y = gc.mouse.y - (view.bbox?.top ?? 0);
			e.pageX = e.x;
			e.pageY = e.y;

			view.component?.handleEvent(gc, e);
		}

		switch (e.type) {
			case "keydown":
				break;
			case "keyup":
				this.scene.emit(Symbol.for("KEYPRESSED"), (e as KeyEvent).key);
				break;
		}
	}

	renderView(gc: GameContext, op) {
		op.component.render(gc);
		// const left = evalNumberValue({ vars: this.vars }, op.pos[0]);
		// const top = evalNumberValue({ vars: this.vars }, op.pos[1]);
		// gc.viewport.ctx.drawImage(op.canvas, left, top);
	}

	update(_gc: GameContext, _scene: Scene) {
		if (this.debugCallback) this.debugCallback();
	}
}
