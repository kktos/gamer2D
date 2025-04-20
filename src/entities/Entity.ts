import ENV from "../env";
import { EventBuffer } from "../events/EventBuffer";
import type GameContext from "../game/GameContext";
import type ResourceManager from "../game/ResourceManager";
import type { SpriteSheet } from "../game/Spritesheet";
import type { COLLISION, Point } from "../maths/math";
import type { Scene } from "../scene/Scene";
import type { ITrait, Trait } from "../traits/Trait";
import { DIRECTIONS } from "../types/direction.type";
import { generateID } from "../utils/id.util";

export class Entity {
	public class: string;
	public id: string;

	public currSprite: string | null;
	public spritesheet: SpriteSheet | null;
	public size: Point;
	public vel: Point;
	public mass: number;
	public speed: number;
	public dir: number;
	public lifetime: number;
	public points: number;

	public isSolid: boolean;
	public isFixed: boolean;
	// a ghost won't interact with the player
	public isGhost: boolean;

	public previousBbox: { left: number; top: number; right: number; bottom: number };
	public traits: Map<string, Trait>;
	public events: EventBuffer;

	private _pos: Point;
	private previousVel: Point;
	private previousMass: number;
	private collidesTraits: Trait[];
	private updateTraits: Trait[];

	constructor(resourceMgr: ResourceManager, x: number, y: number, sheetFilename?: string) {
		const m = String(this.constructor).match(/class ([a-zA-Z0-9_]+)/);
		this.class = m?.[1] ?? "Entity??";
		this.id = generateID();

		this._pos = { x, y };
		this.size = { x: 0, y: 0 };
		this.vel = { x: 0, y: 0 };
		this.speed = 0;
		this.mass = 1;
		this.isFixed = true;
		this.isSolid = true;
		this.previousVel = { ...this.vel };
		this.previousMass = this.mass;
		this.previousBbox = { left: x, top: y, right: 0, bottom: 0 };
		this.dir = DIRECTIONS.LEFT;

		this.isGhost = false;

		// how much killing it will be added to/substracted from the player score
		this.points = 0;

		this.lifetime = 0;
		this.events = new EventBuffer();
		this.traits = new Map();
		this.collidesTraits = [];
		this.updateTraits = [];

		this.currSprite = null;
		this.spritesheet = sheetFilename ? (resourceMgr.get("sprite", sheetFilename) as SpriteSheet) : null;
	}

	get left() {
		return this._pos.x;
	}
	get right() {
		return this._pos.x + this.size.x;
	}
	get top() {
		return this._pos.y;
	}
	get bottom() {
		return this._pos.y + this.size.y;
	}
	get width() {
		return this.size.x;
	}
	get height() {
		return this.size.y;
	}

	set left(x) {
		this.previousBbox.left = this._pos.x;
		this._pos.x = x;
	}
	set top(y) {
		this.previousBbox.top = this._pos.y;
		this._pos.y = y;
	}
	set right(x) {
		this.previousBbox.left = this._pos.x;
		this._pos.x = x - this.size.x;
	}
	set bottom(y) {
		this.previousBbox.top = this._pos.y;
		this._pos.y = y - this.size.y;
	}
	set width(w) {
		this.previousBbox.right = this.right;
		this.size.x = w;
	}
	set height(h) {
		this.previousBbox.bottom = this.bottom;
		this.size.y = h;
	}

	set(propname, propvalue) {
		this[propname] = propvalue;
	}

	pause() {
		this.previousVel = this.vel;
		this.previousMass = this.mass;
		this.vel = { x: 0, y: 0 };
		this.mass = 0;
	}

	go() {
		this.vel = this.previousVel;
		this.mass = this.previousMass;
	}

	addTrait(trait: Trait) {
		this.traits.set(trait.class, trait);
		if ("collides" in trait) this.collidesTraits.push(trait);
		if ("update" in trait) this.updateTraits.push(trait);
		return trait;
	}

	emit(name: symbol, ...args: unknown[]) {
		this.events.emit(name, ...args);
	}

	setSprite(name: string) {
		if (!this.spritesheet || !this.spritesheet.has(name)) {
			throw new Error(`no sprite ${name}`);
		}

		this.currSprite = name;
		this.size = this.spritesheet.spriteSize(name);
	}

	setAnim(name: string, opt = { paused: false }) {
		if (!this.spritesheet || !this.spritesheet.hasAnim(name)) throw new Error(`no animation ${name}`);

		const anim = this.spritesheet.animations.get(name);
		if (!anim) throw new Error(`no animation ${name}`);

		this.currSprite = name;
		const frame = anim.frame(0);
		this.size = this.spritesheet.spriteSize(frame);
		if (opt.paused) anim.pause();
		return anim;
	}

	collides(gc: GameContext, side: typeof COLLISION, target: Entity) {
		for (const trait of this.collidesTraits) (trait as ITrait).collides(gc, side, this, target);
	}

	update(gc: GameContext, scene: Scene) {
		for (const trait of this.updateTraits) (trait as ITrait).update(gc, this, scene);
		this.lifetime += gc.dt * ENV.FPS;
	}

	finalize() {
		for (const [_, trait] of this.traits) trait.finalize?.(this);
		this.events.clear();
	}

	render(gc: GameContext) {
		const ctx = gc.viewport.ctx;
		ctx.strokeStyle = "gray";
		ctx.strokeRect(this.left, this.top, this.size.x, this.size.y);
		ctx.beginPath();
		ctx.moveTo(this.left, this.top);
		ctx.lineTo(this.right, this.bottom);
		ctx.moveTo(this.right, this.top);
		ctx.lineTo(this.left, this.bottom);
		ctx.stroke();
	}
}
