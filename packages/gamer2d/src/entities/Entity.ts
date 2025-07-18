import { EventBuffer } from "../events/EventBuffer";
import { ResourceManager } from "../game";
import type { SpriteSheet } from "../game/Spritesheet";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import { type ITraitCollides, type ITraitObstructedOn, type ITraitUpdate, type Trait, TraitDict } from "../traits/Trait";
import { getTraitClassname } from "../traits/Trait.factory";
import { DIRECTIONS } from "../types/direction.type";
import { generateID } from "../utils/id.util";
import { BBox } from "../utils/maths/BBox.class";
import type { GridCell } from "../utils/maths/grid.math";
import type { Point, TCollisionSide } from "../utils/maths/math";
import { getClassName } from "../utils/object.util";

export class Entity {
	public class: string;
	public id: string;

	public currSprite: string | null;
	public spritesheet?: SpriteSheet;
	public speed: number;
	public dir: number;
	public points: number;

	// some can handle zoom
	public zoom: number;

	public isSolid: boolean;
	public isFixed: boolean;
	// a ghost won't interact with the player
	public isGhost: boolean;

	private traits: TraitDict;
	public events: EventBuffer;

	public bbox: BBox;

	private _lifetime: number;
	private _vel: Point = { x: 0, y: 0 };
	private _mass = 0;
	private previousVel: Point = { x: 0, y: 0 };
	private previousMass = 0;

	private collidesTraits: ITraitCollides[];
	private updateTraits: ITraitUpdate[];
	private obstructedOnTraits: ITraitObstructedOn[];

	// constructor(resourceMgr: ResourceManager, x: number, y: number, sheetFilename?: string) {
	constructor(x: number, y: number, spritesheetName?: string) {
		this.class = getClassName(this.constructor);
		this.id = generateID();

		// this._pos = { x, y };
		this.bbox = new BBox(x, y, 0, 0);
		this.vel = { x: 0, y: 0 };
		this.speed = 0;
		this.mass = 1;
		this.zoom = 1;
		this.isFixed = true;
		this.isSolid = true;
		this.dir = DIRECTIONS.LEFT;

		this.isGhost = false;

		// how much killing it will be added to/substracted from the player score
		this.points = 0;
		this._lifetime = 0;

		this.events = new EventBuffer();

		this.traits = new TraitDict();
		this.collidesTraits = [];
		this.updateTraits = [];
		this.obstructedOnTraits = [];

		this.currSprite = null;
		// this.spritesheet = sheetFilename ? (resourceMgr.get("sprite", sheetFilename) as SpriteSheet) : null;
		if (spritesheetName) this.spritesheet = ResourceManager.getSpritesheet(spritesheetName);
	}

	public get mass() {
		return this._mass;
	}
	public set mass(newValue: number) {
		this.previousMass = this._mass;
		this._mass = newValue;
	}

	// TODO: no direct access to object; use class instead
	public get vel() {
		return this._vel;
		// const handler = {
		// 	get(target, prop, receiver) {
		// 		return Reflect.get(target, prop, receiver);
		// 	},
		// 	set(target, prop, value) {
		// 		console.log(prop, value);
		// 		return Reflect.set(target, prop, value);
		// 	},
		// };
		// const proxy = new Proxy(this._vel, handler);
		// return proxy; //this._vel;
	}
	public set vel(newValue: Point) {
		this.previousVel = this._vel;
		this._vel = newValue;
	}

	public get lifetime() {
		return this._lifetime;
	}

	public set(...args: unknown[]) {
		if (args.length % 2) throw new TypeError("Needs key/value pairs");
		for (let idx = 0; idx < args.length; idx += 2) {
			if (typeof args[idx] !== "string") throw new TypeError(`Needs a propname string ${idx}:${args[idx]}`);
			const propname: string = args[idx] as string;

			if (!(propname in this)) throw new TypeError(`Not a valid propname ${idx}:${args[idx]}`);

			let propvalue = args[idx + 1];

			const signalvalue = propvalue as { value: unknown; __signal__: boolean };
			if (signalvalue && typeof signalvalue === "object" && signalvalue.__signal__) {
				propvalue = signalvalue.value;
			}

			if (typeof this[propname] === "object" && this[propname].__signal__) {
				this[propname].value = propvalue;
			} else {
				this[propname] = propvalue;
			}
		}
		return this;
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

	public addTraits(traits: Trait[]) {
		for (const trait of traits) this.addTrait(trait);
	}

	public useTrait<T extends Trait>(name: string, fn: (trait: T) => void) {
		const trait = this.traits.get(name) as T;
		if (trait) fn(trait);
	}

	public trait<T extends Trait>(name: string) {
		return this.traits.get(getTraitClassname(name)) as T;
	}

	// public trait<K extends keyof TraitNameMap>(name: K): TraitNameMap[K] | undefined {
	// 	return this.traits.get(getTraitClassname(name)) as TraitNameMap[K] | undefined;
	// }

	public queue(name: symbol, ...args: unknown[]) {
		this.events.queue(name, ...args);
	}

	public setSprite(name: string) {
		if (!this.spritesheet || !this.spritesheet.has(name)) throw new Error(`no sprite ${name}`);

		this.currSprite = name;
		this.bbox.setSize(this.spritesheet.spriteSize(name));
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
		ctx.fillRect(this.bbox.left, this.bbox.top, this.bbox.width, this.bbox.height);
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(this.bbox.left, this.bbox.top);
		ctx.lineTo(this.bbox.right, this.bbox.bottom);
		ctx.moveTo(this.bbox.right, this.bbox.top);
		ctx.lineTo(this.bbox.left, this.bbox.bottom);
		ctx.stroke();
	}
}
