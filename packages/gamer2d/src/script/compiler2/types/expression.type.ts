export type TNeatExpression = TNeatTerm[];

export type TNeatOperator = "+" | "-" | "*" | "/" | "%" | "!" | "PLUS" | "NEG";

export type TNeatTerm =
	| TNeatConstTerm
	| TNeatVarTerm
	| { type: "op"; op: TNeatOperator }
	| { type: "array"; value: TNeatExpression[] }
	| { type: "object"; value: Record<string, TNeatExpression> }
	| { type: "prop" }
	| { type: "fn"; name: string; args: TNeatExpression[] };

export type TNeatVarTerm = { type: "var"; name: string };
export type TNeatConstTerm = { type: "const"; value: number | string };
