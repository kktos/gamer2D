import type { GameContext } from "../game/types/GameContext";
import { Scene } from "./Scene";
import { SceneFactory } from "./Scene.factory";

export default class Director {
	constructor(
		private gc: GameContext,
		private scenes: Scene[] = [],
		private sceneIndex = -1,
	) {}

	addScene(scene: Scene) {
		scene.on(Scene.SCENE_COMPLETED, (nameOrIdx) => {
			if (typeof nameOrIdx === "number") {
				if (nameOrIdx < 0) this.runPrevious();
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
		if (this.currentScene.isPermanent) return;
		this.scenes.splice(this.sceneIndex, 1);
	}

	runPrevious() {
		this.pauseScene();
		this.sceneIndex--;
		if (this.sceneIndex < 0) this.sceneIndex = 0;
		if (this.currentScene) {
			this.currentScene.init(this.gc).run();
		}
	}
	runNext() {
		this.pauseScene();
		this.sceneIndex++;
		if (this.currentScene) {
			this.currentScene.init(this.gc).run();
		}
	}

	run(name: string) {
		this.pauseScene();
		const sceneIdx = this.scenes.findIndex((scene) => scene.filename === name);
		if (sceneIdx >= 0) {
			this.sceneIndex = sceneIdx;
			this.currentScene.init(this.gc).run();
			return;
		}

		SceneFactory.load(this.gc, name).then((scene) => {
			this.addScene(scene);
			this.sceneIndex = this.scenes.length - 1;
			this.currentScene.init(this.gc).run();
		});
	}

	handleEvent(gc: GameContext, e) {
		if (!this.currentScene) return;

		// TODO: add a settings to allow scene reload
		if (e.type === "keyup" && e.ctrlKey && e.key === "r") {
			this.run(this.currentScene.filename);
			return;
		}
		this.currentScene.handleEvent(gc, e);
	}
	update(gc: GameContext) {
		if (!this.currentScene || !this.currentScene.isRunning) return;
		this.currentScene.update(gc).render(gc);
	}
}
