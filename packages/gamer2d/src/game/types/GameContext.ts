import type { Scene } from "../../scene/Scene";
import type { KeyMap } from "../KeyMap";
import type { ResourceManager } from "../ResourceManager";
import type { GameOptions } from "./GameOptions";

export interface GameContext {
	viewport: {
		width: number;
		height: number;
		canvas: HTMLCanvasElement;
		bbox: DOMRect;
		ctx: CanvasRenderingContext2D;
		ratio: number;
		ratioWidth: number;
		ratioHeight: number;
	};

	ui: {
		height: number;
	};

	resourceManager: ResourceManager;
	options: GameOptions;

	FPS: number;
	dt: number;
	tick: number;
	deltaTime: number;
	totalTime: number;

	mouse: { x: number; y: number; down: boolean };
	gamepad: { id: number; lastTime: number } | null;
	keys: KeyMap;
	scene: Scene | null;

	gravity?: number;

	wannaPauseOnBlur: boolean;

	globals: {
		set: (name, value) => void;
		get: (name) => unknown;
		has: (name) => boolean;
	};
}
