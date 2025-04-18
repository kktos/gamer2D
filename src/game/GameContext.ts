import type { Scene } from "../scene/Scene";
import type { KeyMap } from "./KeyMap";
import type ResourceManager from "./ResourceManager";

export default interface GameContext {
	viewport: {
		width: number;
		height: number;
		canvas: HTMLCanvasElement;
		bbox: DOMRect;
		ctx: CanvasRenderingContext2D;
		ratioWidth: number;
		ratioHeight: number;
	};

	resourceManager: ResourceManager;

	dt: number;
	tick: number;
	deltaTime: number;
	totalTime: number;

	mouse: { x: number; y: number; down: boolean };
	gamepad: { id: number; lastTime: number } | null;
	keys: KeyMap;
	scene: Scene | null;

	wannaPauseOnBlur: boolean;
}
