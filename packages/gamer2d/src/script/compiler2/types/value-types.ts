export type TNeatOperations = "+" | "-" | "*" | "/" | "%" | "!" | "PLUS" | "NEG";

export type TNeatInstruction =
	| TNeatInstructionConst
	| TNeatInstructionVar
	| { type: "op"; op: TNeatOperations }
	| { type: "fn"; name: string; args: TNeatInstruction[] };

export type TNeatInstructionVar = { type: "var"; name: string };
export type TNeatInstructionConst = { type: "const"; value: number | string };
