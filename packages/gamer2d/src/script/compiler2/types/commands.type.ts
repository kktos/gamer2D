import type { TNeatInstruction } from "./value-types";

type TNeatPropertyAt = { x: TNeatInstruction[]; y: TNeatInstruction[] };
type TNeatPropertySize = { width: TNeatInstruction[]; height: TNeatInstruction[] };

export type TNeatCommand =
	| TNeatFontCommand
	| TNeatColorCommand
	| TNeatAlignCommand
	| TNeatTextCommand
	| TNeatSpriteCommand
	| TNeatRectCommand
	| TNeatViewCommand
	| TNeatAssignCommand
	| TNeatForCommand;

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
	at: TNeatPropertyAt;
	size: TNeatPropertySize;
	id?: string;
	pad?: [TNeatInstruction[], TNeatInstruction[]];
	fill?: unknown;
	color?: unknown;
};

export type TNeatTextCommand = {
	cmd: "TEXT";
	value: TNeatInstruction[];
	at: TNeatPropertyAt;
	font?: { name?: string; size?: number };
	size?: TNeatPropertySize;
	id?: string;
	align?: TNeatAlignCommand;
	anim?: string;
	traits?: unknown;
	nocache?: boolean;
};

export type TNeatSpriteCommand = {
	cmd: "SPRITE";
	name: string;
	at: TNeatPropertyAt;
	size?: TNeatPropertySize;
	id?: string;
	anim?: string;
	dir?: string;
	traits?: unknown;
};

export type TNeatImageCommand = {
	cmd: "IMAGE";
	source: string;
	at: TNeatPropertyAt;
	repeat?: [TNeatInstruction[], TNeatInstruction[]];
};

export type TNeatViewCommand = {
	cmd: "VIEW";
	type: string;
	at: TNeatPropertyAt;
	size: TNeatPropertySize;
	id?: string;
};

export type TNeatItemCommand = {
	cmd: "ITEM";
	body: TNeatCommand[];
};

export type TNeatVariableForCommand = {
	cmd: "FOR";
	var: string;
	list: TNeatInstruction[];
	index?: string;
	body: TNeatCommand[];
};
export type TNeatRangeForCommand = {
	cmd: "FOR";
	list: [TNeatInstruction[], TNeatInstruction[]];
	index: string;
	body: TNeatCommand[];
};
export type TNeatForCommand = TNeatVariableForCommand | TNeatRangeForCommand;
