export class KeyMap {
	private map: Map<string, boolean>;

	constructor() {
		this.map = new Map();
	}

	get(key) {
		if (!this.map.has(key)) this.map.set(key, false);
		return this.map.get(key);
	}

	set(key, pressed) {
		this.map.set(key, pressed);
	}

	isPressed(key) {
		return this.get(key) === true;
	}
}
