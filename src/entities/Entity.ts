import { EventBuffer } from "../events/EventBuffer";
import type ResourceManager from "../game/ResourceManager";
import type { SpriteSheet } from "../game/Spritesheet";
import type GameContext from "../game/types/GameContext";
import type { GridCell } from "../maths/grid.math";
import type { BBox, Point, TCollisionSide } from "../maths/math";
import type { Scene } from "../scene/Scene";
import type { ITraitCollides, ITraitObstructedOn, ITraitUpdate, Trait } from "../traits/Trait";
import { DIRECTIONS } from "../types/direction.type";
import { generateID } from "../utils/id.util";
import { getClassName } from "../utils/object.util";

export class Entity {
	public class: string;
	public id: string;

	public currSprite: string | null;
	public spritesheet: SpriteSheet | null;
	public speed: number;
	public dir: number;
	public points: number;

	public isSolid: boolean;
	public isFixed: boolean;
	// a ghost won't interact with the player
	public isGhost: boolean;

	public previousBbox: BBox;
	private traits: Map<string, Trait>;
	public events: EventBuffer;

	private _lifetime: number;
	private _vel: Point = { x: 0, y: 0 };
	private _mass = 0;
	private _pos: Point;
	private _size: Point = { x: 0, y: 0 };
	private previousVel: Point = { x: 0, y: 0 };
	private previousMass = 0;

	private collidesTraits: ITraitCollides[];
	private updateTraits: ITraitUpdate[];
	private obstructedOnTraits: ITraitObstructedOn[];

	constructor(resourceMgr: ResourceManager, x: number, y: number, sheetFilename?: string) {
		this.class = getClassName(this.constructor);
		this.id = generateID();

		this._pos = { x, y };
		this.previousBbox = { left: x, top: y, right: 0, bottom: 0 };
		this.vel = { x: 0, y: 0 };
		this.speed = 0;
		this.mass = 1;
		this.isFixed = true;
		this.isSolid = true;
		this.dir = DIRECTIONS.LEFT;

		this.isGhost = false;

		// how much killing it will be added to/substracted from the player score
		this.points = 0;
		this._lifetime = 0;

		this.events = new EventBuffer();
		this.traits = new Map();
		this.collidesTraits = [];
		this.updateTraits = [];
		this.obstructedOnTraits = [];

		this.currSprite = null;
		this.spritesheet = sheetFilename ? (resourceMgr.get("sprite", sheetFilename) as SpriteSheet) : null;
	}

	public get left() {
		return this._pos.x;
	}
	public get right() {
		return this._pos.x + this._size.x;
	}
	public get top() {
		return this._pos.y;
	}
	public get bottom() {
		return this._pos.y + this._size.y;
	}
	public get width() {
		return this._size.x;
	}
	public get height() {
		return this._size.y;
	}

	public set left(x) {
		this.previousBbox.left = this._pos.x;
		this.previousBbox.right = this._pos.x + this._size.x;
		this._pos.x = x;
	}
	public set top(y) {
		this.previousBbox.top = this._pos.y;
		this.previousBbox.bottom = this._pos.y + this._size.y;
		this._pos.y = y;
	}
	public set right(x) {
		this.previousBbox.left = this._pos.x;
		this.previousBbox.right = this._pos.x + this._size.x;
		this._pos.x = x - this._size.x;
	}
	public set bottom(y) {
		this.previousBbox.top = this._pos.y;
		this.previousBbox.bottom = this._pos.y + this._size.y;
		this._pos.y = y - this._size.y;
	}
	public set width(w) {
		this.previousBbox.right = this.right;
		this._size.x = w;
	}
	public set height(h) {
		this.previousBbox.bottom = this.bottom;
		this._size.y = h;
	}

	public get mass() {
		return this._mass;
	}
	public set mass(newValue: number) {
		this.previousMass = this._mass;
		this._mass = newValue;
	}

	public get vel() {
		return this._vel;
	}
	public set vel(newValue: Point) {
		this.previousVel = this._vel;
		this._vel = newValue;
	}

	public get lifetime() {
		return this._lifetime;
	}

	public set(propname, propvalue) {
		this[propname] = propvalue;
	}

	public pause() {
		this.vel = { x: 0, y: 0 };
		this.mass = 0;
	}

	public go() {
		this._vel = this.previousVel;
		this._mass = this.previousMass;
	}

	public addTrait(trait: Trait) {
		this.traits.set(trait.class, trait);
		if ("collides" in trait) this.collidesTraits.push(trait as ITraitCollides);
		if ("update" in trait) this.updateTraits.push(trait as ITraitUpdate);
		if ("obstructedOn" in trait) this.obstructedOnTraits.push(trait as ITraitObstructedOn);
		return trait;
	}

	public useTrait<T extends Trait>(name: string, fn: (trait: T) => void) {
		const trait = this.traits.get(name) as T;
		if (trait) fn(trait);
	}

	public emit(name: symbol, ...args: unknown[]) {
		this.events.emit(name, ...args);
	}

	public setSprite(name: string) {
		if (!this.spritesheet || !this.spritesheet.has(name)) throw new Error(`no sprite ${name}`);

		this.currSprite = name;
		this._size = this.spritesheet.spriteSize(name);
	}

	// TODO: probably useless; commented out for now
	// public setAnim(name: string, opt = { paused: false }) {
	// 	if (!this.spritesheet || !this.spritesheet.hasAnim(name)) throw new Error(`no animation ${name}`);

	// 	const anim = this.spritesheet.animations.get(name);
	// 	if (!anim) throw new Error(`no animation ${name}`);

	// 	this.currSprite = name;
	// 	const frame = anim.frame(0);
	// 	this._size = this.spritesheet.spriteSize(frame);
	// 	if (opt.paused) anim.pause();
	// 	return anim;
	// }

	public collides(gc: GameContext, target: Entity) {
		for (const trait of this.collidesTraits) trait.collides(gc, this, target);
	}

	public obstructedOn(gc: GameContext, side: TCollisionSide, cell: GridCell) {
		for (const trait of this.obstructedOnTraits) trait.obstructedOn(gc, this, side, cell);
	}

	public update(gc: GameContext, scene: Scene) {
		for (const trait of this.updateTraits) trait.update(gc, this, scene);
		this._lifetime += gc.dt * gc.FPS;
	}

	public finalize() {
		for (const [_, trait] of this.traits) trait.finalize?.(this);
		this.events.clear();
	}

	public render(gc: GameContext) {
		const ctx = gc.viewport.ctx;
		ctx.fillStyle = "gray";
		ctx.fillRect(this.left, this.top, this.width, this.height);
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(this.left, this.top);
		ctx.lineTo(this.right, this.bottom);
		ctx.moveTo(this.right, this.top);
		ctx.lineTo(this.left, this.bottom);
		ctx.stroke();
	}
}
