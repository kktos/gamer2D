type ExprOperations = "Plus" | "Minus" | "Multiply" | "Divide";
export class ArgExpression {
	constructor(public stack: (number | ArgVariable | ArgColor | ExprOperations)[]) {}

	toString() {
		return `expr(${this.stack.join(",")})`;
	}
}

export class ArgVariable {
	constructor(public value: string) {}

	toString() {
		return `$${this.value}`;
	}
}

export class ArgIdentifier {
	constructor(public value: string) {}

	toString() {
		return `ArgIdentifier "${this.value}"`;
	}
}

export class ArgColor {
	constructor(public value: string) {}

	get rgba() {
		const m = this.value.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?/);
		if (!m) throw new TypeError(`Invalid color value ${this.value}`);
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
		public args: (ArgColor | ArgIdentifier | ArgVariable | string | number | ArgExpression)[],
	) {}
}
