import type { Entity } from "../entities/Entity";
import { createEntity } from "../entities/EntityFactory";
import TextEntity, { type TextDTO } from "../entities/text.entity";
import ENV from "../env";
import { Events } from "../events/Events";
import type Audio from "../game/Audio";
import type Font from "../game/Font";
import type GameContext from "../game/GameContext";
import { type BBox, ptInRect } from "../maths/math";
import { Scene } from "../scene/Scene";
import type { SceneSheet } from "../scene/Scene.factory";
import type { TStatement } from "../script/compiler/display/layout/layout.rules";
import type { TMenu } from "../script/compiler/display/layout/menu.rules";
import type { TText } from "../script/compiler/display/layout/text.rules";
import type { TView } from "../script/compiler/display/layout/view.rules";
import { evalExpr, evalNumber } from "../script/engine/eval.script";
import { execAction } from "../script/engine/exec.script";
import { OP_TYPES, OP_TYPES_STR } from "../script/types/operation.types";
import PathTrait from "../traits/path.trait";
import type { TVarSounds, TVarSprites, TVars } from "../types/engine.types";
import LocalDB from "../utils/storage.util";
import { UILayer } from "./UILayer";
import { prepareMenu, renderMenu } from "./display/menu.manager";
import { repeat } from "./display/repeat.manager";
import { renderSprite } from "./display/sprite.renderer";
import { Timers } from "./display/timers.class";
import type { View } from "./display/views/View";
import { initViews, views } from "./display/views/views";
import { EntitiesLayer } from "./entities.layer";

type TViewDesc = TView & {
	component?: View;
	canvas?: HTMLCanvasElement;
	bbox?: BBox;
};

export class DisplayLayer extends UILayer {
	static EVENT_TIME_OUT = Symbol.for("TIME_OUT");

	public timers: Timers | null;
	public font: Font;
	public itemSelected: number;
	public vars: TVars;

	private layout: TStatement[];
	private time: number;
	private blinkFlag: boolean;
	private isMouseEnabled: boolean;
	private wannaDisplayHitzones: boolean;
	private lastJoyTime: number;
	private menu: TMenu | null;
	private views: TViewDesc[];

	constructor(gc: GameContext, parent: Scene, sheet: SceneSheet) {
		super(gc, parent, sheet.ui);

		const rezMgr = gc.resourceManager;
		this.font = rezMgr.get("font", sheet.font ?? ENV.MAIN_FONT) as Font;

		this.layout = sheet.layout as TStatement[];
		this.time = 0;
		this.blinkFlag = false;
		this.isMouseEnabled = true;
		this.wannaDisplayHitzones = false;
		this.lastJoyTime = 0;

		this.itemSelected = 0;

		this.vars = new Map();
		this.initVars();

		const menus = this.layout.filter((op) => op.type === OP_TYPES.MENU) as unknown as TMenu[];
		if (menus.length > 1) throw new Error("Only one menu is allowed per viewport");

		this.menu = menus.length > 0 ? menus[0] : null;

		this.views = this.layout.filter((op) => op.type === OP_TYPES.VIEW) as unknown as TViewDesc[];
		initViews({ canvas: gc.viewport.canvas, gc, vars: this.vars, layer: this });

		this.prepareRendering(gc);

		this.timers = Timers.createTimers(sheet);

		if (sheet.on) {
			for (const [name, value] of Object.entries(sheet.on)) {
				const [eventName, id] = name.split(":");
				parent.events.on(Symbol.for(eventName), (...args) => {
					// biome-ignore lint/suspicious/noDoubleEquals: <explanation>
					if (id && args[0] != id) return;
					execAction({ vars: this.vars }, value.action);
				});
			}
		}

		if (sheet.sounds) {
			const sounds: TVarSounds = new Map();
			for (const [key, soundDef] of Object.entries(sheet.sounds)) {
				const [soundSheet, name] = key.split(":");
				const audio = rezMgr.get("audio", soundSheet) as Audio;
				const sound = {
					name,
					audio,
					play: () => audio.play(name),
				};
				if (soundDef.play) {
					parent.events.on(Scene.EVENT_START, () => sound.audio.play(name));
				}
				sounds.set(key, sound);
			}
			this.vars.set("sounds", sounds);
		}
	}

	destroy() {
		for (let idx = 0; idx < this.views.length; idx++) {
			const view = this.views[idx];
			view.component?.destroy();
		}
	}

	initVars() {
		this.vars.set("highscores", LocalDB.highscores());
		this.vars.set("player", LocalDB.currentPlayer());
		this.vars.set("itemIdxSelected", this.itemSelected);
		this.vars.set("itemSelected", "");

		this.vars.set("mouseX", 0);
		this.vars.set("mouseY", 0);

		const spriteList: Entity[] = [];
		const sprites: TVarSprites = {
			get: (idx: number) => spriteList[idx],
			add: (sprite: Entity) => {
				spriteList.push(sprite);
			},
		};
		this.vars.set("sprites", sprites);

		this.vars.set("clientHeight", ENV.VIEWPORT_HEIGHT);
		this.vars.set("clientWidth", ENV.VIEWPORT_WIDTH);
		this.vars.set("centerX", Math.floor(ENV.VIEWPORT_WIDTH / 2));
		this.vars.set("centerY", Math.floor(ENV.VIEWPORT_HEIGHT / 2));
		this.vars.set("centerUIY", Math.floor((this.gc.viewport.bbox.height - ENV.UI_HEIGHT) / 2 / this.gc.viewport.ratioHeight));
	}

	selectMenuItem(idx: number) {
		if (!this.menu) return;
		this.itemSelected = (idx < 0 ? this.menu.items.length - 1 : idx) % this.menu.items.length;

		if (this.menu.selection?.var) {
			this.vars.set(this.menu.selection.var, this.itemSelected);
		} else {
			this.vars.set("itemIdxSelected", this.itemSelected);
			this.vars.set("itemSelected", this.menu?.items[this.itemSelected]);
		}
		this.scene.events.emit(Events.MENU_ITEM_SELECTED, this.itemSelected);
	}

	execMenuItemAction(gc: GameContext, idx?: number) {
		if (!this.menu) return;

		const selectedIdx = idx == null ? this.itemSelected : idx;
		const menuItem = this.menu.items[selectedIdx];

		if ("action" in menuItem) {
			return execAction({ vars: this.vars }, menuItem.action);
		}

		this.scene.events.emit(Events.MENU_ITEM_CLICKED, selectedIdx);
	}

	addText(op: TText & { entity?: Entity }) {
		const posX = () => evalNumber({ vars: this.vars }, op.pos[0]);
		const posY = () => evalNumber({ vars: this.vars }, op.pos[1]);
		const textObj: TextDTO = {
			pos: () => [posX(), posY()],
			align: op.align,
			valign: op.valign,
			size: op.size,
			color: op.color,
			anim: op.anim,
			bgcolor: op.bgcolor,
			text: () => evalExpr({ vars: this.vars }, op.text) as string,
		};
		if (op.width) textObj.width = evalNumber({ vars: this.vars }, op.width);
		if (op.height) textObj.height = evalNumber({ vars: this.vars }, op.height);

		const entity = new TextEntity(this.gc.resourceManager, textObj);
		this.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
		op.entity = entity;
	}

	// addSprite(op:TSprite & { entity: Entity }) {
	addSprite(op) {
		const entity = createEntity(this.gc.resourceManager, op.sprite, op.pos[0], op.pos[1], op.dir);
		if (op.anim) {
			const anim = this.vars.get(op.anim.name);
			if (!anim) {
				throw new Error(`Animation ${op.anim.name} not found`);
			}
			entity.addTrait(new PathTrait(anim));
		}
		this.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
		op.entity = entity;
		const sprites = this.vars.get("sprites") as TVarSprites;
		if (!sprites) throw new Error("No variable sprites !?!");
		sprites.add(entity);
	}

	prepareRendering(gc: GameContext) {
		const views = this.layout.filter((op) => op.type === OP_TYPES.VIEW);
		for (const view of views) {
			this.vars.set(view.name, null);
		}

		// console.log(">>> LAYOUT", this.layout);

		for (let idx = 0; idx < this.layout.length; idx++) {
			const op = this.layout[idx];
			switch (op.type) {
				case OP_TYPES.TEXT: {
					this.addText(op);
					break;
				}
				case OP_TYPES.SPRITE: {
					this.addSprite(op);
					break;
				}
				case OP_TYPES.ANIM: {
					this.vars.set(op.name, op);
					break;
				}
				case OP_TYPES.SET:
					this.vars.set(op.name, evalExpr({ vars: this.vars }, op.value));
					break;
				case OP_TYPES.REPEAT:
					repeat(op, (item) => this.layout.push(item), this.vars);
					break;
				case OP_TYPES.VIEW:
					this.prepareView(gc, op);
					break;
			}
		}

		if (this.menu) prepareMenu(gc, this, this.menu);
	}

	prepareView(gc: GameContext, viewDesc: TViewDesc) {
		if (!views[viewDesc.view]) throw new TypeError(`Unknown View Type ${viewDesc.view}`);

		const width = evalNumber({ vars: this.vars }, viewDesc.width);
		const height = evalNumber({ vars: this.vars }, viewDesc.height);
		const left = evalNumber({ vars: this.vars }, viewDesc.pos[0]);
		const top = evalNumber({ vars: this.vars }, viewDesc.pos[1]);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const ctx = { canvas, gc, vars: this.vars, layer: this };

		viewDesc.component = new views[viewDesc.view](ctx);
		viewDesc.canvas = canvas;
		viewDesc.bbox = {
			left,
			top,
			right: width + left,
			bottom: height + top,
		};
		this.vars.set(viewDesc.name, viewDesc.component || null);
	}

	findMenuByPoint(x: number, y: number) {
		return this.menu ? this.menu.items.findIndex((item) => "bbox" in item && ptInRect(x, y, item.bbox)) : -1;
	}

	menuMoveUp() {
		if (this.menu) {
			this.selectMenuItem(this.itemSelected - 1);
		}
	}

	menuMoveDown() {
		if (this.menu) this.selectMenuItem(this.itemSelected + 1);
	}

	handleEvent(gc, e) {
		switch (e.type) {
			case "click":
				if (this.isMouseEnabled && this.menu) {
					const menuIdx = this.findMenuByPoint(e.x, e.y);
					if (menuIdx >= 0) this.execMenuItemAction(gc, menuIdx);
				}
				break;

			// case "joyaxismove":
			// 	if(e.timestamp - this.lastJoyTime < 200)
			// 		return;
			// 	this.lastJoyTime= e.timestamp;
			// 	if(e.vertical < -0.1)
			// 		return this.menuMoveUp();
			// 	if(e.vertical > 0.1)
			// 		return this.menuMoveDown();

			case "joybuttondown":
				if (e.X || e.TRIGGER_RIGHT) return this.execMenuItemAction(gc);
				if (e.CURSOR_UP) return this.menuMoveUp();
				if (e.CURSOR_DOWN) return this.menuMoveDown();
				break;

			case "mousemove":
				this.vars.set("mouseX", e.x);
				this.vars.set("mouseY", e.y);

				if (this.isMouseEnabled && this.menu) {
					const menuIdx = this.findMenuByPoint(e.x, e.y);
					if (menuIdx >= 0) this.selectMenuItem(menuIdx);
					gc.viewport.canvas.style.cursor = menuIdx >= 0 ? "pointer" : "default";
				}
				break;

			case "keyup":
				switch (e.key) {
					case "Control":
						this.wannaDisplayHitzones = false;
						break;
				}
				break;

			case "keydown":
				switch (e.key) {
					case "Control":
						this.wannaDisplayHitzones = true;
						break;

					case "ArrowDown":
					case "ArrowRight":
						this.menuMoveDown();
						break;
					case "ArrowUp":
					case "ArrowLeft":
						this.menuMoveUp();
						break;
					case "Enter":
						this.execMenuItemAction(gc);
						break;
				}
				break;
		}

		// console.log("DisplayLayer.handleEvent", e);

		for (let idx = 0; idx < this.views.length; idx++) {
			const view = this.views[idx];

			// if(["mousemove", "mouseup","mousedown", "click"].includes(e.type)) {
			// 	if(!ptInRect(e.x, e.y, view.bbox)) {
			// 		continue;
			// 	}
			// }

			const localEvent = {
				...e,
				pageX: e.x,
				pageY: e.y,
				x: e.x - Number(view.pos[0]),
				y: e.y - Number(view.pos[1]),
			};
			view.component?.handleEvent(gc, localEvent);
		}
	}

	renderRect({ viewport: { ctx } }, op) {
		ctx.fillStyle = op.color;
		ctx.fillRect(
			evalNumber({ vars: this.vars }, op.pos[0]),
			evalNumber({ vars: this.vars }, op.pos[1]),
			evalNumber({ vars: this.vars }, op.width),
			evalNumber({ vars: this.vars }, op.height),
		);
		// ctx.strokeStyle= op.color;
		// ctx.strokeRect(op.pos[0], op.pos[1], op.width, op.height);
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
				// case OP_TYPES.SPRITE:
				// 	renderSprite(gc, this, op);
				// 	break;
				case OP_TYPES.IMAGE:
					renderSprite(gc, this, op);
					break;
				case OP_TYPES.MENU:
					renderMenu(gc, this, op);
					break;
				case OP_TYPES.RECT:
					this.renderRect(gc, op);
					break;
				case OP_TYPES.VIEW:
					this.renderView(gc, op);
					break;
				// default:
				// 	throw new Error(`Unkown operation ${op.type}`);
			}
		}

		if (this.wannaDisplayHitzones && this.menu) {
			const items = this.menu.items;
			for (let idx = 0; idx < items.length; idx++) {
				const item = items[idx];
				if ("bbox" in item && item.bbox) {
					ctx.strokeStyle = "red";
					ctx.strokeRect(item.bbox.left, item.bbox.top, item.bbox.right - item.bbox.left, item.bbox.bottom - item.bbox.top);
					ctx.fillStyle = "red";
					ctx.fillText(`${OP_TYPES_STR[item.type]}`, item.bbox.left, item.bbox.bottom + 10);
				}

				ctx.fillStyle = "white";
				const str = `Selected: ${this.itemSelected} X: ${this.gc.mouse.x} Y: ${this.gc.mouse.y}`;
				ctx.fillText(str, gc.viewport.width - 200, gc.viewport.height - 15);
			}
		}
	}
}
