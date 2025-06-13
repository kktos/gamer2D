export type TNeatOperations = "+" | "-" | "*" | "/" | "%" | "!" | "PLUS" | "NEG";

export type TNeatInstruction =
	| TNeatInstructionConst
	| TNeatInstructionVar
	| { type: "op"; op: TNeatOperations }
	| { type: "fn"; name: string; args: TNeatInstruction[] };

export type TNeatInstructionVar = { type: "var"; name: string };
export type TNeatInstructionConst = { type: "const"; value: number | string };

export type TNeatAssignCommand = {
	cmd: "ASSIGN";
	name: TNeatInstruction[];
	value: TNeatInstruction[];
};

export type TNeatFontCommand = {
	cmd: "FONT";
	name?: string;
	size?: number;
};

export type TNeatAlignCommand = {
	cmd: "ALIGN";
	align: string;
	valign?: string;
};

export type TNeatColorCommand = {
	cmd: "COLOR";
	color: string;
};

export type TNeatRectCommand = {
	cmd: "RECT";
	at: { x: unknown; y: unknown };
	size?: { width: unknown; height: unknown };
	id?: string;
	pad?: [unknown, unknown];
	fill?: unknown;
	color?: unknown;
};

export type TNeatTextCommand = {
	cmd: "TEXT";
	value: unknown;
	at: { x: unknown; y: unknown };
	font?: { name?: string; size?: number };
	size?: { width: unknown; height: unknown };
	id?: string;
	align?: TNeatAlignCommand;
	anim?: string;
	traits?: unknown;
	nocache?: boolean;
};
