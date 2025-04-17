export class ArgVariable {
	constructor(public value: string) {}
}

export class ArgIdentifier {
	constructor(public value: string) {}
}

export class ArgColor {
	constructor(public value: string) {}

	get rgba() {
		const m = this.value.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?/);
		return { r: Number.parseInt(m[1], 16), g: Number.parseInt(m[2], 16), b: Number.parseInt(m[3], 16), a: Number.parseInt(m[4], 16) || 255 };
	}
	add(other: ArgColor) {
		const { r: r1, g: g1, b: b1, a: a1 } = this.rgba;
		const { r: r2, g: g2, b: b2, a: a2 } = other.rgba;
		const hex = (s: number) => s.toString(16).padStart(2, "0");
		return `#${hex(r1 + r2)}${hex(g1 + g2)}${hex(b1 + b2)}${hex(a1 + a2)}`;
	}
}

export class ValueTrait {
	constructor(
		public name: string,
		public args: unknown[],
	) {}
}
