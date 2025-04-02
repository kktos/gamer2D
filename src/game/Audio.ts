import ENV from "../env";
import { loadJson, loadSound } from "../utils/loaders.util";

const audioContext = new window.AudioContext();
unlockAudioContext(audioContext);

function unlockAudioContext(audioCtx: AudioContext) {
	if (audioCtx.state === "suspended") {
		console.log("!! AudioContext suspended !!");

		const events = ["touchstart", "touchend", "mousedown", "keydown"];
		const unlock = () => {
			for (const event of events) {
				document.body.removeEventListener(event, unlock);
			}
			// events.forEach((event) =>
			// 	document.body.removeEventListener(event, unlock),
			// );
			audioCtx.resume();
			console.log("!! AudioContext resumed !!");
		};
		for (const event of events) {
			document.body.addEventListener(event, unlock, false);
		}
		// events.forEach((event) =>
		// 	document.body.addEventListener(event, unlock, false),
		// );
	}
}

async function loadFile(context: AudioContext, soundName: string) {
	return loadSound(soundName)
		.then((arrayBuffer) => {
			return new Promise<AudioBuffer>((resolve, reject) => {
				console.log(`decodeAudioData(${soundName})`);
				context.decodeAudioData(
					arrayBuffer,
					(buffer) => {
						console.log(`decodeAudioData(${soundName}) OK`);
						resolve(buffer);
					},
					(e) => {
						console.error(`decodeAudioData(${soundName}) ERR:'${e}'`);
						reject(e);
					},
				);
			});
		})
		.catch((err) => console.error(`loadSound(${soundName})`, err));
}

async function loadSounds(sheet) {
	const audio = new Audio();
	return Promise.all(
		Object.keys(sheet).map((name) =>
			loadFile(audio.context, sheet[name].sound)
				.then((buf) => {
					if (buf) audio.add(name, buf);
				})
				.catch((err) => console.error(`loadFile(${sheet[name].sound})`, err)),
		),
	).then(() => audio);
}

export default class Audio {
	private buffers: Map<string, AudioBuffer>;
	private gainNode: GainNode;
	public context: AudioContext;

	static load(filename: string) {
		return loadJson(ENV.SOUNDS_PATH + filename)
			.then((sheet) => loadSounds(sheet))
			.catch((err) => console.error(`Audio.load(${filename})`, err));
	}

	constructor() {
		this.buffers = new Map();
		this.context = audioContext;
		this.gainNode = this.context.createGain();
		this.gainNode.gain.value = (ENV.VOLUME / 100) ** 2;
	}

	add(name: string, buffer: AudioBuffer) {
		this.buffers.set(name, buffer);
	}

	play(name: string) {
		const buffer = this.buffers.get(name);
		if (!buffer) {
			console.error(`Audio.play(${name}) - no such sound`);
			return;
		}

		return new Promise((resolve) => {
			const source = this.context.createBufferSource();
			source.connect(this.gainNode);
			this.gainNode.connect(this.context.destination);
			source.buffer = buffer;
			source.start(0);
			source.onended = () => resolve(name);
		});
	}
}
