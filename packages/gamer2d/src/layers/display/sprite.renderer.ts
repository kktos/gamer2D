import type { SpriteSheet } from "../../game/Spritesheet";
import { getRandom } from "../../maths/math";
import type { TImage } from "../../script/compiler/layers/display/layout/image.rules";
import type { TSprite } from "../../script/compiler/layers/display/layout/sprite.rules";

type TState = {
	ss: SpriteSheet;
	sprite: string;
	animation: string | null;
	size: { width: number; height: number };
	pos: number[];
	path: { getNextPoint: (dt: number) => number[] } | null;
};

function animBuilder(anim, state) {
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
				return [Math.floor(center[0] + radius * Math.cos(dir * angle)), Math.floor(center[1] + radius * Math.sin(dir * angle))];
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

export function renderSprite({ resourceManager, deltaTime, tick, viewport: { ctx } }, layer, op: (TSprite | TImage) & { state?: TState }) {
	if (!op.state) {
		const { ss, sprite } = loadSprite({ resourceManager }, op.name);
		const names = sprite.split("@");
		op.state = {
			ss,
			sprite,
			animation: null,
			size: { width: 0, height: 0 },
			pos: op.pos,
			path: null,
		};
		if (names.length > 1) {
			op.state.animation = names[1];
		} else {
			op.state.size = ss.spriteSize(sprite);
		}
		if ("anim" in op && op.anim) {
			const anim = layer.vars.get(op.anim.name);
			op.state.path = animBuilder(anim, op.state);
		}
	}
	const state = op.state;

	if (state.path) {
		state.pos = state.path.getNextPoint(deltaTime);
	}

	const zoom = op.zoom || 1;
	let [countX, countY] = op.range || [1, 1];
	if (countX <= 0) countX = 1;
	if (countY <= 0) countY = 1;

	const [x, y] = state.pos;

	if (state.animation) {
		state.ss.drawAnim(state.animation, ctx, x, y, tick, { zoom });
		return;
	}

	for (let row = 0; row < countY; row++) {
		for (let col = 0; col < countX; col++) {
			state.ss.draw(state.sprite, ctx, x + col * (state.size.width * zoom), y + row * (state.size.height * zoom), { flip: 0, zoom });
		}
	}
}

export function loadSprite({ resourceManager }, name: string) {
	const [sheet, sprite] = name.split(":");
	const ss = resourceManager.get("sprite", sheet) as SpriteSheet;
	return { ss, sprite };
}
