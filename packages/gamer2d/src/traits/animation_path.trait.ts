import type { Entity } from "../entities/Entity";
import type { Scene } from "../scenes/Scene";
import type { TNeatCommand } from "../script/compiler2/types/commands.type";
import type { TNeatFunctionTerm } from "../script/compiler2/types/expression.type";
import type { ExecutionContext } from "../script/engine2/exec.context";
import { evalExpression } from "../script/engine2/expr.eval";
import { DIRECTIONS } from "../types";
import type { Point } from "../utils/maths/math";
import { Trait } from "./Trait";
import { setupTrait } from "./Trait.factory";

const TAU = 2 * Math.PI;
const toRad = Math.PI / 180;

type TEasingFunction = (t: number) => number;

const easingFunctions = {
	linear: (t: number) => t,
	easeOut: (t: number) => 1 - (1 - t) ** 3, // Cubic ease out
	easeIn: (t: number) => t * t * t, // Cubic ease in
	easeInOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
	bounceOut: (t: number) => {
		const n1 = 7.5625;
		const d1 = 2.75;
		if (t < 1 / d1) return n1 * t * t;

		if (t < 2 / d1) {
			// biome-ignore lint/style/noParameterAssign: quicker
			t -= 1.5 / d1;
			return n1 * t * t + 0.75;
		}

		if (t < 2.5 / d1) {
			// biome-ignore lint/style/noParameterAssign: quicker
			t -= 2.25 / d1;
			return n1 * t * t + 0.9375;
		}

		// biome-ignore lint/style/noParameterAssign: quicker
		t -= 2.625 / d1;
		return n1 * t * t + 0.984375;
	},
	easeOutElastic: (x: number) => {
		const c4 = TAU / 3;
		return x === 0 ? 0 : x === 1 ? 1 : 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
	},
};

export type TAnimationPathPathDTO = {
	name: string;
	repeat: number;
	hasAutostart: boolean;
	statements: TNeatCommand[];
	pause?: () => void;
	play?: () => void;
	reset?: () => void;
};

export class AnimationPathTrait extends Trait {
	static EVENT_ANIM_DONE = Symbol.for("ANIM_DONE");

	private isRunning: boolean;
	private pathDef: TAnimationPathPathDTO;
	private currentAnimation: Iterator<Point | null> | null = null;
	private easingFn: TEasingFunction = easingFunctions.linear;
	private duration = 1;
	// private step = 1;

	constructor(
		private readonly context: ExecutionContext,
		pathDef: TAnimationPathPathDTO,
	) {
		super();
		this.pathDef = pathDef;

		pathDef.pause = this.pause.bind(this);
		pathDef.play = this.play.bind(this);
		pathDef.reset = this.reset.bind(this);

		this.isRunning = pathDef.hasAutostart;
	}

	private createAnimation(entity: Entity): Iterator<Point | null> {
		const self = this;

		let repeatCount = self.pathDef.repeat;
		return (function* () {
			do {
				for (const command of self.pathDef.statements) {
					yield* self.processCommand(command, entity);
				}
			} while (--repeatCount);
		})();
	}

	private *processCommand(command: TNeatCommand, entity: Entity): Generator<Point | null, void, number> {
		if (command.cmd !== "CALL") {
			yield { x: entity.bbox.left, y: entity.bbox.top };
			return;
		}
		const fn = command.value[0] as TNeatFunctionTerm;
		const args = fn.args.map((arg) => evalExpression(arg, this.context));

		switch (fn.name) {
			case "moveTo": {
				if (args.length !== 2) throw new TypeError("moveTo needs 2 arguments moveTo(x,y)");
				if (typeof args[0] !== "number" || typeof args[1] !== "number") throw new TypeError("moveTo arguments must be numbers");
				yield { x: args[0], y: args[1] };
				break;
			}

			case "easing": {
				if (args.length !== 1) throw new TypeError("easing needs 1 argument easing(function)");
				if (typeof args[0] !== "string") throw new TypeError("easing argument must be a string");
				if (!(args[0] in easingFunctions)) throw new TypeError(`Unknown easing function: ${args[0]}`);
				this.easingFn = easingFunctions[args[0]];
				break;
			}

			case "duration": {
				if (args.length !== 1) throw new TypeError("duration needs 1 argument duration(ms)");
				if (typeof args[0] !== "number") throw new TypeError("duration argument must be a number");
				this.duration = args[0];
				yield { x: entity.bbox.left, y: entity.bbox.top };
				break;
			}

			// case "step": {
			// 	if (args.length !== 1) throw new TypeError("step needs 1 argument step(number)");
			// 	if (typeof args[0] !== "number") throw new TypeError("step argument must be a number");
			// 	this.step = args[0];
			// 	yield { x: entity.bbox.left, y: entity.bbox.top };
			// 	break;
			// }

			case "walkTo": {
				if (args.length !== 2) throw new TypeError("walkTo needs 2 arguments walkTo(x,y)");
				if (typeof args[0] !== "number" || typeof args[1] !== "number") throw new TypeError("walkTo arguments must be numbers");
				const pointGenerator = this.walkAlongLine(entity.bbox.left, entity.bbox.top, args[0], args[1]);
				yield* withEasing(pointGenerator, this.easingFn, this.duration);
				break;
			}

			case "face": {
				entity.dir = args[0] === "left" ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
				yield { x: entity.bbox.left, y: entity.bbox.top };
				break;
			}

			case "pause": {
				if (args.length !== 1) throw new TypeError("pause needs 1 arguments pause(duration)");
				if (typeof args[0] !== "number") throw new TypeError("pause argument must be a number");
				yield* this.waitForDuration(args[0], entity);
				break;
			}

			case "prop": {
				if (args.length !== 2) throw new TypeError("prop needs 2 arguments prop(name, values)");
				if (typeof args[0] !== "string") throw new TypeError("prop first argument must be a string");
				const pointGenerator = this.cycleProp(args[0], args[1], entity);
				yield* withEasing(pointGenerator, this.easingFn, this.duration);
				break;
			}

			case "circle": {
				if (args.length !== 4) throw new TypeError("circle needs 4 arguments circle(duration)");
				if (typeof args[0] !== "number" || typeof args[1] !== "number" || typeof args[2] !== "number" || typeof args[3] !== "number")
					throw new TypeError("circle arguments must be numbers");
				const pointGenerator = this.moveInCircle(args[0], args[1], args[2], args[3]);
				yield* withEasing(pointGenerator, this.easingFn, this.duration);
				break;
			}
		}
	}
	private *walkAlongLine(fromX: number, fromY: number, toX: number, toY: number): Generator<Point | null, void, number> {
		const dx = toX - fromX;
		const dy = toY - fromY;

		while (true) {
			const progress = yield null; // Receive progress from easing wrapper

			if (progress >= 1) {
				yield { x: toX, y: toY };
				break;
			}

			const currentX = fromX + dx * progress;
			const currentY = fromY + dy * progress;

			yield { x: currentX, y: currentY };
		}
	}

	private *waitForDuration(seconds: number, entity: Entity): Generator<Point | null, void, number> {
		const currentPos = { x: entity.bbox.left, y: entity.bbox.top };
		let elapsedTime = 0;

		while (elapsedTime < seconds) {
			const deltaTime = yield currentPos;
			elapsedTime += deltaTime;
		}
	}

	private *cycleProp(propName: string, valueOrValues: unknown, entity: Entity, mode: "step" | "interpolate" = "step"): Generator<Point | null, void, number> {
		const currentPos = { x: entity.bbox.left, y: entity.bbox.top };

		const setValue = (value) => {
			if (typeof entity[propName] === "object" && entity[propName].__signal__) entity[propName].value = value;
			else entity[propName] = value;
		};

		// Handle single value case
		if (!Array.isArray(valueOrValues)) {
			setValue(valueOrValues);
			yield currentPos;
			return;
		}

		if (valueOrValues.length === 0) {
			yield currentPos;
			return;
		}

		const canInterpolate = mode === "interpolate" && valueOrValues.every((v) => typeof v === "number");

		if (canInterpolate) {
			while (true) {
				const progress = yield null;

				if (progress >= 1) {
					setValue(valueOrValues[valueOrValues.length - 1]);
					yield currentPos;
					break;
				}

				// Interpolate between values
				const scaledProgress = progress * (valueOrValues.length - 1);
				const lowerIndex = Math.floor(scaledProgress);
				const upperIndex = Math.min(lowerIndex + 1, valueOrValues.length - 1);
				const t = scaledProgress - lowerIndex;

				const interpolatedValue = valueOrValues[lowerIndex] * (1 - t) + valueOrValues[upperIndex] * t;
				setValue(interpolatedValue);
				yield currentPos;
			}
			return;
		}

		while (true) {
			const progress = yield null;
			if (progress >= 1) {
				setValue(valueOrValues[valueOrValues.length - 1]);
				yield currentPos;
				break;
			}
			const index = Math.min(Math.floor(valueOrValues.length * progress), valueOrValues.length - 1);
			setValue(valueOrValues[index]);
			yield currentPos;
		}
	}

	private *moveInCircle(centerX: number, centerY: number, radius: number, startAngleDegrees: number): Generator<Point | null, void, number> {
		const startAngle = Math.abs(startAngleDegrees) * toRad;
		const totalAngleChange = Math.sign(startAngleDegrees) >= 0 ? TAU : -TAU; // Full circle

		while (true) {
			const progress = yield null; // Receive progress from easing wrapper

			if (progress >= 1) {
				// Final position
				const finalAngle = startAngle + totalAngleChange;
				const x = centerX + radius * Math.cos(finalAngle);
				const y = centerY + radius * Math.sin(finalAngle);
				yield { x, y };
				break;
			}

			// Calculate current angle based on progress
			const currentAngle = startAngle + totalAngleChange * progress;
			const x = centerX + radius * Math.cos(currentAngle);
			const y = centerY + radius * Math.sin(currentAngle);

			yield { x, y };
		}
	}

	update({ deltaTime }, entity: Entity, scene: Scene) {
		if (!this.isRunning || entity.isFixed) return;

		if (!this.currentAnimation) this.currentAnimation = this.createAnimation(entity);

		const result = this.currentAnimation.next(deltaTime);

		if (result.done) {
			this.isRunning = false;
			scene.emit(AnimationPathTrait.EVENT_ANIM_DONE, this.pathDef.name, entity.id);
			return;
		}

		const point = result.value;
		if (point) entity.bbox.setPosition(point.x, point.y);
	}

	public play() {
		this.isRunning = true;
	}

	public pause() {
		this.isRunning = false;
	}

	public reset() {
		this.currentAnimation = null;
		this.isRunning = true;
	}
}

function* withEasing<T>(generator: Generator<T, void, number>, easingFn: TEasingFunction, duration: number): Generator<T, void, number> {
	let elapsedTime = 0;
	let result = generator.next(0);

	while (!result.done) {
		const deltaTime = yield result.value;
		elapsedTime += deltaTime;

		// Calculate linear progress (0 to 1)
		const linearProgress = Math.min(elapsedTime / duration, 1);

		// Apply easing to get eased progress
		const easedProgress = easingFn(linearProgress);

		result = generator.next(easedProgress);

		if (linearProgress >= 1) break;
	}
}

setupTrait({ name: "AnimationPathTrait", alias: "AnimationPath", classType: AnimationPathTrait });
