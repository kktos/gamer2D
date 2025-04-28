import type { Entity } from "../entities/Entity";
import { createEntity } from "../entities/Entity.factory";
import type Font from "../game/Font";
import type GameContext from "../game/types/GameContext";
import type { GameEvent } from "../game/types/GameEvent";
import type { BBox } from "../maths/math";
import type { Scene } from "../scene/Scene";
import type { TSceneDisplaySheet } from "../script/compiler/layers/display/display.rules";
import type { TFunctionCall } from "../script/compiler/layers/display/layout/action.rules";
import type { TStatement } from "../script/compiler/layers/display/layout/layout.rules";
import type { TRect } from "../script/compiler/layers/display/layout/rect.rules";
import type { TView } from "../script/compiler/layers/display/layout/view.rules";
import type { TEventHandlers } from "../script/compiler/layers/display/on.rules";
import { evalArg, evalNumber, evalValue } from "../script/engine/eval.script";
import { execAction } from "../script/engine/exec.script";
import { type PathDefDTO, PathTrait } from "../traits/path.trait";
import type { TVars } from "../types/engine.types";
import { OP_TYPES } from "../types/operation.types";
import LocalDB from "../utils/storage.util";
import { UILayer } from "./UILayer";
import { GameMenu } from "./display/menu/menu.manager";
import { repeat } from "./display/repeat.manager";
import { initSounds } from "./display/sound.manager";
import { renderSprite } from "./display/sprite.renderer";
import { addText } from "./display/text.manager";
import { Timers } from "./display/timers.class";
import type { View } from "./display/views/View";
import { initViews, views } from "./display/views/views";
import { EntitiesLayer } from "./entities.layer";

type TViewDef = TView & {
	component?: View;
	canvas?: HTMLCanvasElement;
	bbox?: BBox;
};

export class DisplayLayer extends UILayer {
	static EVENT_TIME_OUT = Symbol.for("TIME_OUT");

	public timers: Timers | null;
	public font: Font;
	public vars: TVars;
	public wannaShowCursor: boolean;

	private layout: TStatement[];
	private time: number;
	private blinkFlag: boolean;
	// private lastJoyTime: number;
	private views: TViewDef[];

	private menu: GameMenu | null;

	constructor(gc: GameContext, parent: Scene, sheet: TSceneDisplaySheet) {
		super(gc, parent, sheet.ui);

		const rezMgr = gc.resourceManager;
		this.font = rezMgr.get<Font>("font", sheet.font ?? gc.resourceManager.mainFontName);

		this.layout = sheet.layout as TStatement[];
		this.time = 0;
		this.blinkFlag = false;
		// this.lastJoyTime = 0;
		this.wannaShowCursor = !!sheet.showCursor;

		this.vars = new Map();
		this.initVars(gc);

		this.views = this.layout.filter((op) => op.type === OP_TYPES.VIEW) as unknown as TViewDef[];
		initViews({ canvas: gc.viewport.canvas, gc, vars: this.vars, layer: this });

		const menus = this.layout.filter((op) => op.type === OP_TYPES.MENU);
		this.menu = GameMenu.create(gc, this, menus);

		this.prepareRendering(gc);
		this.menu?.prepareMenu();

		this.timers = Timers.createTimers(sheet);
		if (sheet.on) this.initEventHandlers(sheet.on, parent);
		if (sheet.sounds) this.vars.set("sounds", initSounds({ soundDefs: sheet.sounds, parent, resourceManager: rezMgr }));
	}

	destroy() {
		for (let idx = 0; idx < this.views.length; idx++) {
			const view = this.views[idx];
			view.component?.destroy();
		}
	}

	initVars(gc: GameContext) {
		this.vars.set("highscores", LocalDB.highscores());
		this.vars.set("player", LocalDB.currentPlayer());

		this.vars.set("mouseX", 0);
		this.vars.set("mouseY", 0);

		this.vars.set("sprites", new Map<string, Entity>());

		this.vars.set("clientHeight", gc.viewport.height);
		this.vars.set("clientWidth", gc.viewport.width);
		this.vars.set("centerX", Math.floor(gc.viewport.width / 2));
		this.vars.set("centerY", Math.floor(gc.viewport.height / 2));
		this.vars.set("centerUIY", Math.floor((this.gc.viewport.bbox.height - gc.ui.height) / 2 / this.gc.viewport.ratioHeight));
	}

	initEventHandlers(EventHandlers: TEventHandlers, parent: Scene) {
		for (const [name, value] of Object.entries(EventHandlers)) {
			const [eventName, id] = name.split(":");
			parent.on(Symbol.for(eventName), (...args) => {
				// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
				if (id && args[0] != id) return;
				execAction({ vars: this.vars }, value.action);
			});
		}
	}

	// addSprite(op:TSprite & { entity: Entity }) {
	addSprite(op) {
		const entity = createEntity(this.gc.resourceManager, op.sprite, op.pos[0], op.pos[1], op.dir);
		if (op.id) entity.id = op.id;

		if (op.anim) {
			const anim = this.vars.get(op.anim.name) as { path: TFunctionCall[]; speed: number };
			if (!anim) {
				throw new Error(`Animation ${op.anim.name} not found`);
			}
			const animDTO: PathDefDTO = {
				path: anim.path,
				speed: anim.speed,
			};
			entity.addTrait(new PathTrait(animDTO, { evalArg: (arg) => evalArg({ vars: this.vars }, arg) }));
		}
		this.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
		// op.entity = entity;
		const sprites = this.vars.get("sprites") as Map<string, Entity>; // as TVarSprites;
		if (!sprites) throw new Error("No variable sprites !?!");
		sprites.set(entity.id, entity); //.add(entity);

		return entity;
	}

	prepareRendering(gc: GameContext) {
		const views = this.layout.filter((op) => op.type === OP_TYPES.VIEW);
		for (const view of views) {
			this.vars.set(view.name, 0);
		}

		// console.log(">>> LAYOUT", this.layout);

		for (let idx = 0; idx < this.layout.length; idx++) {
			const op = this.layout[idx];
			switch (op.type) {
				case OP_TYPES.TEXT: {
					op.entity = addText(this, op);
					break;
				}
				case OP_TYPES.SPRITE: {
					op.entity = this.addSprite(op);
					break;
				}
				case OP_TYPES.ANIM: {
					this.vars.set(op.name, op);
					break;
				}
				case OP_TYPES.SET:
					// this.vars.set(op.name, oldEvalValue({ vars: this.vars }, op.value));
					this.vars.set(op.name, evalValue({ vars: this.vars }, op.value));
					break;
				case OP_TYPES.REPEAT:
					repeat(op, (item) => this.layout.push(item), this.vars);
					break;
				case OP_TYPES.VIEW:
					this.prepareView(gc, op);
					break;
			}
		}
	}

	prepareView(gc: GameContext, viewDef: TViewDef) {
		if (!views[viewDef.view]) throw new TypeError(`Unknown View Type ${viewDef.view}`);

		const width = evalNumber({ vars: this.vars }, viewDef.width);
		const height = evalNumber({ vars: this.vars }, viewDef.height);
		const left = evalNumber({ vars: this.vars }, viewDef.pos[0]);
		const top = evalNumber({ vars: this.vars }, viewDef.pos[1]);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = { canvas, gc, vars: this.vars, layer: this };

		viewDef.component = new views[viewDef.view](ctx);
		viewDef.canvas = canvas;
		viewDef.bbox = {
			left,
			top,
			right: width + left,
			bottom: height + top,
		};
		this.vars.set(viewDef.name, viewDef.component || 0);
	}

	handleEvent(gc: GameContext, e: GameEvent) {
		switch (e.type) {
			case "click":
				break;

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

		this.menu?.handleEvent(e);

		// console.log("DisplayLayer.handleEvent", e);

		for (let idx = 0; idx < this.views.length; idx++) {
			const view = this.views[idx];

			// if(["mousemove", "mouseup","mousedown", "click"].includes(e.type)) {
			// 	if(!ptInRect(e.x, e.y, view.bbox)) {
			// 		continue;
			// 	}
			// }

			if ("x" in e) {
				e.x = e.x - Number(view.pos[0]);
				e.y = e.y - Number(view.pos[1]);
				e.pageX = e.x;
				e.pageY = e.y;
			}
			view.component?.handleEvent(gc, e);
		}
	}

	renderRect({ viewport: { ctx } }, op: TRect) {
		let x = evalNumber({ vars: this.vars }, op.pos[0]);
		let y = evalNumber({ vars: this.vars }, op.pos[1]);
		let w = evalNumber({ vars: this.vars }, op.width);
		let h = evalNumber({ vars: this.vars }, op.height);

		if (op.pad) {
			const padX = evalNumber({ vars: this.vars }, op.pad[0]);
			const padY = evalNumber({ vars: this.vars }, op.pad[1]);
			x = x - padX;
			y = y - padY;
			w = w + padX * 2;
			h = h + padY * 2;
		}

		if (op.fill) {
			ctx.fillStyle = op.fill.value;
			ctx.fillRect(x, y, w, h);
		} else {
			ctx.strokeStyle = op.color?.value;
			ctx.strokeRect(x, y, w, h);
		}
	}

	renderView(gc: GameContext, op) {
		op.component.render(gc);
		// gc.viewport.ctx.imageSmoothingEnabled = false;
		// gc.viewport.ctx.globalAlpha= 1;
		// gc.viewport.ctx.globalCompositeOperation = "source-over";
		const left = evalNumber({ vars: this.vars }, op.pos[0]);
		const top = evalNumber({ vars: this.vars }, op.pos[1]);

		gc.viewport.ctx.drawImage(op.canvas, left, top);
	}

	update(gc: GameContext, scene: Scene) {
		this.timers?.update(gc, scene);
	}

	render(gc: GameContext) {
		const ctx = gc.viewport.ctx;

		this.time += (gc.dt * 1000) | 0;
		if (!((this.time % 500) | 0)) this.blinkFlag = !this.blinkFlag;

		for (let idx = 0; idx < this.layout.length; idx++) {
			const op = this.layout[idx];
			switch (op.type) {
				case OP_TYPES.IMAGE:
					renderSprite(gc, this, op);
					break;
				case OP_TYPES.MENU:
					this.menu?.renderMenu(ctx);
					break;
				case OP_TYPES.RECT:
					this.renderRect(gc, op);
					break;
				case OP_TYPES.VIEW:
					this.renderView(gc, op);
					break;
			}
		}
	}
}
