import type GameContext from "../game/GameContext";
import { Scene } from "./Scene";
import { SceneFactory } from "./Scene.factory";

export default class Director {
	sceneIndex: number;
	scenes: Scene[];
	gc: GameContext;

	constructor(gc: GameContext) {
		this.sceneIndex = -1;
		this.scenes = [];
		this.gc = gc;
	}

	addScene(scene: Scene) {
		scene.events.on(Scene.EVENT_COMPLETE, (nameOrIdx: unknown) => {
			if (Number.isInteger(nameOrIdx)) {
				if ((nameOrIdx as number) < 0) this.runPrevious();
				else this.runNext();
			} else this.run(nameOrIdx as string);
		});
		this.scenes.push(scene);
	}

	get currentScene() {
		return this.scenes[this.sceneIndex];
	}

	pauseScene() {
		if (!this.currentScene) return;
		this.currentScene.pause();
		this.currentScene.killOnExit && this.scenes.splice(this.sceneIndex, 1);
	}

	runPrevious() {
		this.pauseScene();
		this.sceneIndex--;
		if (this.sceneIndex < 0) this.sceneIndex = 0;
		if (this.currentScene) {
			this.currentScene.init(this.gc);
			this.currentScene.run();
		}
	}
	runNext() {
		this.pauseScene();
		this.sceneIndex++;
		if (this.currentScene) {
			this.currentScene.init(this.gc);
			this.currentScene.run();
		}
	}

	run(name: string) {
		this.pauseScene();
		const sceneIdx = this.scenes.findIndex((scene) => scene.name === name);
		if (sceneIdx >= 0) {
			this.sceneIndex = sceneIdx;
			if (this.currentScene) {
				this.currentScene.init(this.gc);
				this.currentScene.run();
			}
			return;
		}

		SceneFactory.load(this.gc, name).then((scene) => {
			this.addScene(scene);
			this.sceneIndex = this.scenes.length - 1;
			this.currentScene.init(this.gc);
			this.currentScene.run();
		});
	}

	handleEvent(gc: GameContext, e) {
		if (this.currentScene) this.currentScene.handleEvent(gc, e);
	}
	update(gc: GameContext) {
		if (!this.currentScene?.isRunning) return;
		this.currentScene?.update(gc);
		this.currentScene?.render(gc);
	}
}
