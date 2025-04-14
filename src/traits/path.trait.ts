import type { Entity } from "../entities/Entity";
import type { Point } from "../maths/math";
import type { Scene } from "../scene/Scene";
import { DIRECTIONS } from "../script/types/direction.type";
import { Trait } from "./Trait";

type ProviderFn = (deltaTime: number, entity: Entity) => Point | null;

export class PathTrait extends Trait {
	private isRunning: boolean;
	private currentProvider: number;
	private pointProviders: ProviderFn[];

	constructor(pathDef) {
		super();

		// console.log(pathDef);

		this.isRunning = true;
		this.currentProvider = 0;
		this.pointProviders = [];

		for (const path of pathDef.path) {
			const p = path[0];
			let provider: ProviderFn | null = null;
			switch (p.name[1]) {
				case "line": {
					provider = createLinePointProvider(p.args[0], p.args[1], p.args[2], p.args[3], p.args[4], pathDef.speed);
					break;
				}
				case "circle": {
					provider = createCirclePointProvider(p.args[0], p.args[1], p.args[2], p.args[3], pathDef.speed);
					break;
				}
				case "dir": {
					provider = (_, entity) => {
						entity.dir = p.args[0] === "left" ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
						return null;
					};
					break;
				}
				case "loop": {
					provider = (_, entity) => {
						this.currentProvider = -1;
						return null;
					};
					break;
				}
			}
			if (provider) this.pointProviders.push(provider);
		}
	}

	getNextPoint(deltaTime: number, entity: Entity) {
		let point = this.pointProviders[this.currentProvider](deltaTime, entity);
		if (!point) {
			if (this.currentProvider >= this.pointProviders.length - 1) this.isRunning = false;
			this.currentProvider = (this.currentProvider + 1) % this.pointProviders.length;
			point = { x: entity.left, y: entity.top };
		}
		return point;
	}

	/*
	animBuilder(anim, state) {
		const kind = anim.path[0].name[0];
		switch (kind) {
			case "circle": {
				const speed = Math.abs(anim.speed) ?? 1;
				const dir = anim.speed < 0 ? -1 : 1;
				const center = [anim.path[0].args[0], anim.path[0].args[1]];
				const radius = anim.path[0].args[2];
				const fullCircle = 2 * Math.PI;
				let angle = (fullCircle * state.pos[0]) / 100;
				const getNextPoint = (dt) => {
					angle = (angle + dt * speed) % fullCircle;
					return [
						Math.floor(center[0] + radius * Math.cos(dir * angle)),
						Math.floor(center[1] + radius * Math.sin(dir * angle)),
					];
				};
				return { getNextPoint };
			}
	
			case "random": {
				const speed = Math.abs(anim.speed) ?? 1;
				const args = anim.path[0].args;
				const xInc = Math.floor(getRandom(args[0], args[1]));
				const yInc = Math.floor(getRandom(args[0], args[1]));
	
				console.log(speed, xInc, yInc);
	
				const getNextPoint = (dt) => {
					return [Math.floor(state.pos[0] + xInc * dt * speed), Math.floor(state.pos[1] + yInc * dt * speed)];
				};
				return { getNextPoint };
			}
		}
		return null;
	}
*/

	update({ deltaTime }, entity: Entity, scene: Scene) {
		if (!this.isRunning) return;

		entity.mass = 0;

		const { x, y } = this.getNextPoint(deltaTime, entity);
		entity.left = x;
		entity.top = y;
	}
}

function createCirclePointProvider(x: number, y: number, radius: number, initialAngle: number, speed: number) {
	// const speed = Math.abs(anim.speed) ?? 1;
	const dir = speed < 0 ? -1 : 1;
	const TAU = 2 * Math.PI;
	const toRad = 180 / Math.PI;
	let angle = ((initialAngle % 360) * Math.PI) / 180; //(TAU * x) / 100;
	const endValue = Math.floor(initialAngle % 360);
	const relativeSpeed = Math.abs(speed) / 10;
	return (deltaTime: number): Point | null => {
		angle = (angle + deltaTime * relativeSpeed) % TAU;
		if (Math.floor(angle * toRad) === endValue) return null;
		return {
			x: Math.floor(x + radius * Math.cos(dir * angle)),
			y: Math.floor(y + radius * Math.sin(dir * angle)),
		};
	};
}

function createLinePointProvider(step: number, x1: number, y1: number, x2: number, y2: number, speed: number) {
	const slope = (y2 - y1) / (x2 - x1);
	const offset = y1 - slope * x1;
	return (deltaTime: number, entity: Entity): Point | null => {
		const x = entity.left + step * speed * deltaTime;
		if (x < x1 || x > x2) return null;
		const y = slope * x + offset;
		return {
			x,
			y,
		};
	};
}
