import type { Audio } from "../../game/Audio";
import type { ResourceManager } from "../../game/ResourceManager";
import { Scene } from "../../scenes/Scene";
import type { TSoundDefs } from "../../script/compiler/layers/display/sound.rules";
import type { TVarSounds } from "../../types/engine.types";

type InitSoundsDef = {
	soundDefs: TSoundDefs;
	parent: Scene;
	resourceManager: ResourceManager;
};
export function initSounds({ soundDefs, parent, resourceManager }: InitSoundsDef) {
	const sounds: TVarSounds = new Map();
	for (const [key, soundDef] of Object.entries(soundDefs)) {
		const [soundSheet, name] = key.split(":");
		const audio = resourceManager.get("audio", soundSheet) as Audio;
		const sound = {
			name,
			audio,
			play: () => audio.play(name),
		};
		if (soundDef.play) {
			parent.on(Scene.SCENE_STARTED, () => sound.audio.play(name));
		}
		sounds.set(key, sound);
	}
	return sounds;
}
