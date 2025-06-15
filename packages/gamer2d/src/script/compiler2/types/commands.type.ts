import type { TNeatExpression } from "./expression.type";

type TNeatPropertyAt = { x: TNeatExpression; y: TNeatExpression };
type TNeatPropertySize = { width: TNeatExpression; height: TNeatExpression };

export type TNeatCommand =
	| TNeatFontCommand
	| TNeatColorCommand
	| TNeatAlignCommand
	| TNeatTextCommand
	| TNeatSpriteCommand
	| TNeatRectCommand
	| TNeatViewCommand
	| TNeatAssignCommand
	| TNeatItemCommand
	| TNeatImageCommand
	| TNeatCallCommand
	| TNeatMenuCommand
	// | TNeatPoolCommand
	| TNeatOnCommand
	| TNeatForCommand;

export type TNeatAssignCommand = {
	cmd: "ASSIGN";
	name: TNeatExpression;
	value: TNeatExpression;
};

export type TNeatCallCommand = {
	cmd: "CALL";
	value: TNeatExpression;
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
	pad?: [TNeatExpression, TNeatExpression];
	fill?: string;
	color?: string;
};

export type TNeatTextCommand = {
	cmd: "TEXT";
	value: TNeatExpression;
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
	repeat?: [TNeatExpression, TNeatExpression];
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

// FOR

export type TNeatVariableForCommand = {
	cmd: "FOR";
	var: string;
	list: TNeatExpression;
	index?: string;
	body: TNeatCommand[];
};
export type TNeatRangeForCommand = {
	cmd: "FOR";
	list: [TNeatExpression, TNeatExpression];
	index: string;
	body: TNeatCommand[];
};
export type TNeatForCommand = TNeatVariableForCommand | TNeatRangeForCommand;

// MENU

type TNeatMenuSelection = {
	// color
	color?: string;
	// bgcolor
	background?: string;
	// left sprite
	left?: string;
	// right sprite
	right?: string;
	// var holding the selection
	var?: string;
};

type TNeatMenuKeys = {
	previous?: TNeatExpression;
	next?: TNeatExpression;
	select?: TNeatExpression;
};

export type TNeatMenuCommand = {
	cmd: "MENU";
	selection: TNeatMenuSelection;
	keys: TNeatMenuKeys;
	items: TNeatCommand[];
};

// ON

export type TNeatOnCommand = {
	cmd: "ON";
	event: string;
	params: string[];
	statements: TNeatCommand[];
};
