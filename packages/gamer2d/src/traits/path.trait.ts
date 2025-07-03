import type { Entity } from "../entities/Entity";
import type { Scene } from "../scenes/Scene";
import type { TAnimDef } from "../script/compiler/layers/display/layout/defanim.rules";
import { typeOfArg } from "../script/engine/eval.script";
import { DIRECTIONS } from "../types/direction.type";
import { ArgColor } from "../types/value.types";
import type { Point } from "../utils/maths/math";
import { Trait } from "./Trait";

type ProviderFn = (deltaTime: number, entity: Entity) => Point | null;
const TAU = 2 * Math.PI;
const toRad = 180 / Math.PI;

export type TPathDefDTO = Required<Pick<TAnimDef, "path" | "speed">>;

export class PathTrait extends Trait {
	private isRunning: boolean;
	private currentProvider: number;
	private pointProviders: ProviderFn[];

	constructor(pathDef: TPathDefDTO, { evalArg }) {
		super();

		// console.log(pathDef);

		this.isRunning = true;
		this.currentProvider = 0;
		this.pointProviders = [];

		for (const path of pathDef.path) {
			const p = path[0];
			let provider: ProviderFn | null = null;
			switch (p.name[0]) {
				case "line": {
					provider = createLinePointProvider(evalArg(p.args[0]), evalArg(p.args[1]), evalArg(p.args[2]), evalArg(p.args[3]), evalArg(p.args[4]), pathDef.speed);
					break;
				}
				case "circle": {
					// console.log("createCirclePointProvider", evalArg(p.args[0]), evalArg(p.args[1]), evalArg(p.args[2]), evalArg(p.args[3]), pathDef.speed);
					provider = createCirclePointProvider(evalArg(p.args[0]), evalArg(p.args[1]), evalArg(p.args[2]), evalArg(p.args[3]), pathDef.speed);
					break;
				}
				case "dir": {
					// console.log("dir", evalArg(p.args[0]));
					provider = (_, entity) => {
						entity.dir = evalArg(p.args[0]) === "left" ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
						return null;
					};
					break;
				}
				case "at": {
					provider = (_, entity) => {
						entity.bbox.setPosition(evalArg(p.args[0]), evalArg(p.args[1]));
						return null;
					};
					break;
				}
				case "prop": {
					// console.log("prop", evalArg(p.args[0]), evalArg(p.args[1]));
					const prop = evalArg(p.args[0]);
					const value = evalArg(p.args[1]);
					const valueType = typeOfArg(p.args[1]);
					let idx = 0;
					provider = (deltaTime: number, entity: Entity) => {
						switch (typeof entity[prop]) {
							case "number":
								if (typeof value === "number") entity[prop] += value;
								break;
							case "string": {
								if (Array.isArray(value)) {
									entity[prop] = value[Math.floor(idx)];
									idx = (idx + deltaTime * pathDef.speed) % value.length;
								} else if (valueType === "color") {
									const col = new ArgColor(entity[prop]);
									entity[prop] = (p.args[1] as ArgColor).add(col);
								}
								break;
							}
						}
						// entity.dir = evalArg(p.args[0]) === "left" ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
						return null;
					};
					break;
				}
				case "loop": {
					provider = (_, _entity) => {
						this.currentProvider = -1;
						return null;
					};
					break;
				}
				default:
					throw new Error("Unknown path command");
			}
			if (provider) this.pointProviders.push(provider);
		}
	}

	getNextPoint(deltaTime: number, entity: Entity) {
		let point = this.pointProviders[this.currentProvider](deltaTime, entity);
		if (!point) {
			if (this.currentProvider >= this.pointProviders.length - 1) this.isRunning = false;
			this.currentProvider = (this.currentProvider + 1) % this.pointProviders.length;
			point = { x: entity.bbox.left, y: entity.bbox.top };
		}
		return point;
	}

	/*
	animBuilder(anim, state) {
		const kind = anim.path[0].name[0];
		switch (kind) {
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

	update({ deltaTime }, entity: Entity, _scene: Scene) {
		if (!this.isRunning || entity.isFixed) return;

		entity.mass = 0;

		const { x, y } = this.getNextPoint(deltaTime, entity);
		entity.bbox.setPosition(x, y);
	}
}

function createCirclePointProvider(centerX: number, centerY: number, radius: number, initialAngle: number, speed: number) {
	// console.log(centerX, centerY, radius, initialAngle, speed);

	// const speed = Math.abs(anim.speed) ?? 1;
	const dir = speed < 0 ? -1 : 1;
	let angle = ((initialAngle % 360) * Math.PI) / 180; //(TAU * x) / 100;
	const endValue = Math.floor(initialAngle % 360);
	const relativeSpeed = Math.abs(speed) / 10;
	const circlePointProvider = (deltaTime: number): Point | null => {
		angle = (angle + deltaTime * relativeSpeed) % TAU;
		if (Math.floor(angle * toRad) === endValue) return null;
		return {
			x: Math.floor(centerX + radius * Math.cos(dir * angle)),
			y: Math.floor(centerY + radius * Math.sin(dir * angle)),
		};
	};
	return circlePointProvider;
}

function createLinePointProvider(step: number, fromX: number, fromY: number, toX: number, toY: number, speed: number) {
	const slope = (toY - fromY) / (toX - fromX);
	const offset = fromY - slope * fromX;
	const linePointProvider = (deltaTime: number, entity: Entity): Point | null => {
		const x = entity.bbox.left + step * speed * deltaTime;
		if (x < fromX || x > toX) return null;
		const y = slope * x + offset;
		return {
			x,
			y,
		};
	};
	return linePointProvider;
}
