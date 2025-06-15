import type { Entity } from "../entities/Entity";
import type { Font } from "../game/Font";
import { GLOBAL_VARIABLES } from "../game/globals";
import type { GameContext } from "../game/types/GameContext";
import type { BaseEvent, KeyEvent } from "../game/types/GameEvent";
import { BBox } from "../maths/BBox.class";
import type { Scene } from "../scene/Scene";
import type { TView } from "../script/compiler/layers/display/layout/view.rules";
import type { TEventHandlerDict } from "../script/compiler/layers/display/on.rules";
import type { TNeatCommand } from "../script/compiler2/types/commands.type";
import { evalNumberValue } from "../script/engine/eval.script";
import { execAction } from "../script/engine/exec.script";
import { runPreparationPhase, runRenderingPhase } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.type";
import type { TNeatFunctions } from "../utils/functionDict.utils";
import { type TVarTypes, TVars } from "../utils/vars.utils";
import { HTMLLayer } from "./HTMLLayer";
import type { GameMenu } from "./display/menu/menu.manager";
import type { Timers } from "./display/timers.class";
import type { View } from "./display/views/View";
import { viewClasses } from "./display/views/View.factory";

type TViewDef = TView & {
	component?: View;
	canvas?: HTMLCanvasElement;
	bbox?: BBox;
};

export class UiLayer extends HTMLLayer {
	public timers: Timers | null;
	public font: Font;
	public vars: TVars;

	private layout: TNeatCommand[];

	private time: number;
	private blinkFlag: boolean;
	// private lastJoyTime: number;
	private views: TViewDef[];

	private menu: GameMenu | null;

	constructor(gc: GameContext, parent: Scene, sheet) {
		super(gc, parent, "ui", sheet.ui);

		const rezMgr = gc.resourceManager;
		this.font = rezMgr.get<Font>("font", sheet.font ?? gc.resourceManager.mainFontName);

		this.layout = sheet.data;
		this.time = 0;
		this.blinkFlag = false;
		// this.lastJoyTime = 0;

		this.vars = new TVars(GLOBAL_VARIABLES);
		this.initVars();
		// EntityPool.clear();

		// this.views = this.layout.filter((op) => op.type === OP_TYPES.VIEW) as unknown as TViewDef[];
		// initViews({ canvas: gc.viewport.canvas, gc, vars: this.vars, layer: this });
		this.views = [];

		// const menus = this.layout.filter((op) => op.type === OP_TYPES.MENU);
		// this.menu = GameMenu.create(gc, this, menus);
		this.menu = null;

		this.prepareRendering(gc);

		// this.menu?.prepareMenu();

		// this.timers = Timers.createTimers(sheet);
		this.timers = null;
		// if (sheet.on) this.initEventHandlers(sheet.on, parent);
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
		this.vars.set("mouseX", 0);
		this.vars.set("mouseY", 0);

		this.vars.set("sprites", new Map<string, Entity>());

		this.vars.set("clientHeight", this.gc.viewport.height);
		this.vars.set("clientWidth", this.gc.viewport.width);
		this.vars.set("centerX", Math.floor(this.gc.viewport.width / 2));
		this.vars.set("centerY", Math.floor(this.gc.viewport.height / 2));
		this.vars.set("centerUIY", Math.floor((this.gc.viewport.bbox.height - this.gc.ui.height) / 2 / this.gc.viewport.ratioHeight));
	}

	initEventHandlers(EventHandlers: TEventHandlerDict, parent: Scene) {
		for (const [name, value] of Object.entries(EventHandlers)) {
			const [eventName, id] = name.split(":");
			const params = value.args;
			parent.on(Symbol.for(eventName), (...args) => {
				if (id) {
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					if (args.shift() != id) return;
				}
				if (params) for (let idx = 0; idx < params.length; idx++) this.vars.set(params[idx], args[idx] as TVarTypes);
				execAction({ vars: this.vars }, value.action);
			});
		}
	}

	prepareRendering(gc: GameContext) {
		const context: ExecutionContext = {
			variables: this.vars,
			functions: null as unknown as TNeatFunctions,
			gc,
		};

		this.layout = runPreparationPhase(this.layout, context);

		console.log("prepareRendering", this.layout);

		// const views = this.layout.filter((op) => op.type === OP_TYPES.VIEW);
		// for (const view of views) this.vars.set(view.id, 0);

		// for (let idx = 0; idx < this.layout.length; idx++) {
		// 	const op = this.layout[idx];
		// 	switch (op.type) {
		// 		case OP_TYPES.TEXT: {
		// 			op.entity = addText(this, op);
		// 			break;
		// 		}
		// 		case OP_TYPES.SPRITE: {
		// 			op.entity = addSprite(this, op);
		// 			break;
		// 		}
		// 		case OP_TYPES.POOL: {
		// 			op.entity = addPool(this, op);
		// 			break;
		// 		}
		// 		case OP_TYPES.ANIM: {
		// 			this.vars.set(op.name, op);
		// 			break;
		// 		}
		// 		case OP_TYPES.SET: {
		// 			execSet({ vars: this.vars }, op);
		// 			break;
		// 		}
		// 		case OP_TYPES.REPEAT:
		// 			repeat(op, (item) => this.layout.push(item), this.vars);
		// 			break;
		// 		case OP_TYPES.VIEW:
		// 			this.prepareView(gc, op);
		// 			break;
		// 	}
		// }
	}

	prepareView(gc: GameContext, viewDef: TViewDef) {
		if (!viewClasses[viewDef.view]) throw new TypeError(`Unknown View Type ${viewDef.view}`);

		const width = evalNumberValue({ vars: this.vars }, viewDef.width);
		const height = evalNumberValue({ vars: this.vars }, viewDef.height);
		const left = evalNumberValue({ vars: this.vars }, viewDef.pos[0]);
		const top = evalNumberValue({ vars: this.vars }, viewDef.pos[1]);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = { canvas, gc, vars: this.vars, layer: this };

		viewDef.component = new viewClasses[viewDef.view](ctx);
		viewDef.canvas = canvas;
		viewDef.bbox = new BBox(left, top, width, height);
		this.vars.set(viewDef.id, viewDef.component || 0);
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
				this.vars.set("mouseX", e.x);
				this.vars.set("mouseY", e.y);
				break;
		}

		if (this.menu?.handleEvent(e)) return;

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

	// renderRect({ viewport: { ctx } }, op: TRect) {
	// 	let x = evalNumber({ vars: this.vars }, op.pos[0]);
	// 	let y = evalNumber({ vars: this.vars }, op.pos[1]);
	// 	let w = evalNumber({ vars: this.vars }, op.width);
	// 	let h = evalNumber({ vars: this.vars }, op.height);

	// 	if (op.pad) {
	// 		const padX = evalNumber({ vars: this.vars }, op.pad[0]);
	// 		const padY = evalNumber({ vars: this.vars }, op.pad[1]);
	// 		x = x - padX;
	// 		y = y - padY;
	// 		w = w + padX * 2;
	// 		h = h + padY * 2;
	// 	}

	// 	if (op.fill) {
	// 		ctx.fillStyle = op.fill.value;
	// 		ctx.fillRect(x, y, w, h);
	// 	} else {
	// 		ctx.strokeStyle = op.color?.value;
	// 		ctx.strokeRect(x, y, w, h);
	// 	}
	// }

	renderView(gc: GameContext, op) {
		op.component.render(gc);
		const left = evalNumberValue({ vars: this.vars }, op.pos[0]);
		const top = evalNumberValue({ vars: this.vars }, op.pos[1]);
		gc.viewport.ctx.drawImage(op.canvas, left, top);
	}

	update(gc: GameContext, scene: Scene) {
		this.timers?.update(gc, scene);
		if (this.debugCallback) this.debugCallback();
	}

	render(gc: GameContext) {
		const ctx = gc.viewport.ctx;

		this.time += (gc.dt * 1000) | 0;
		if (!((this.time % 500) | 0)) this.blinkFlag = !this.blinkFlag;

		const context: ExecutionContext = {
			renderer: {
				drawRect: (x, y, width, height, color, fill) => {
					if (fill) {
						ctx.fillStyle = fill;
						ctx.fillRect(x, y, width, height);
					}
					ctx.strokeStyle = color;
					ctx.strokeRect(x, y, width, height);
				},
			},

			variables: this.vars,
			functions: null as unknown as TNeatFunctions,
		};

		runRenderingPhase(this.layout, context);

		// for (let idx = 0; idx < this.layout.length; idx++) {
		// 	const op = this.layout[idx];
		// 	switch (op.type) {
		// 		case OP_TYPES.IMAGE:
		// 			renderSprite(gc, this, op);
		// 			break;
		// 		case OP_TYPES.MENU:
		// 			this.menu?.renderMenu(ctx);
		// 			break;
		// 		case OP_TYPES.RECT:
		// 			this.renderRect(gc, op);
		// 			break;
		// 		case OP_TYPES.VIEW:
		// 			this.renderView(gc, op);
		// 			break;
		// 	}
		// }
	}
}
