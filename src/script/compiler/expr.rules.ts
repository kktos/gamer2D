import { tokenName } from "chevrotain";
import { ArgExpression } from "../../types/value.types";
import { tokens } from "./lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ExprRules {
	static expr($) {
		return $.RULE("expr", (stack = []) => {
			const result = $.SUBRULE($.exprAddition, { ARGS: [stack] });
			// if (result.opList?.length === 0) return result.lhs;
			if (stack?.length === 1) return stack[0];
			return new ArgExpression(stack);
		});
	}

	static exprAddition($) {
		return $.RULE("exprAddition", (stack) => {
			const lhs = $.SUBRULE($.exprMultiplication, { ARGS: [stack] });
			const opList = [];
			$.MANY(() => {
				// consuming 'AdditionOperator' will consume either Plus or Minus as they are subclasses of AdditionOperator
				const op = $.CONSUME(tokens.AdditionOp);
				//  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
				const rhs = $.SUBRULE2($.exprMultiplication, { ARGS: [stack] });
				// opList.push({ op: tokenName(op.tokenType), rhs, add: 1 });
				opList.push(tokenName(op.tokenType));
				if (stack?.length > 1) {
					if (typeof stack.at(-1) === "number" && typeof stack.at(-2) === "number") {
						const currOp = opList.pop();
						switch (currOp) {
							case "Plus":
								stack.push(stack.pop() + stack.pop());
								break;
							case "Minus":
								stack.push(stack.pop() - stack.pop());
								break;
						}
					}
				}
			});
			const result = opList.length === 0 ? lhs : { lhs, opList, add: 2 };
			// const result = { lhs, opList, add: 2 };
			stack?.push(...opList);
			return result;
		});
	}

	static exprMultiplication($) {
		return $.RULE("exprMultiplication", (stack) => {
			const lhs = $.SUBRULE($.exprScalar, { ARGS: [stack] });
			const opList = [];
			$.MANY(() => {
				// consuming 'AdditionOperator' will consume either Plus or Minus as they are subclasses of AdditionOperator
				const op = $.CONSUME(tokens.MultiplicationOp);
				//  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
				$.SUBRULE2($.exprScalar, { ARGS: [stack] });
				// opList.push({ op: tokenName(op.tokenType), rhs, mult: 1 });
				opList.push(tokenName(op.tokenType));
				if (stack?.length > 1) {
					if (typeof stack.at(-1) === "number" && typeof stack.at(-2) === "number") {
						const currOp = opList.pop();
						switch (currOp) {
							case "Multiply":
								stack.push(stack.pop() * stack.pop());
								break;
							case "Divide":
								stack.push(stack.pop() / stack.pop());
								break;
						}
					}
				}
			});
			const result = opList.length === 0 ? lhs : { lhs, opList };
			// const result = { lhs, opList };
			stack?.push(...opList);
			return result;
		});
	}

	static exprScalar($) {
		return $.RULE("exprScalar", (stack) => {
			return $.OR([
				{ ALT: () => $.SUBRULE($.exprSubExpr, { ARGS: [stack] }) },
				{
					ALT: () => {
						const result = $.SUBRULE($.numOrVar);
						stack?.push(result);
						return result;
					},
				},
			]);
		});
	}

	static exprSubExpr($) {
		return $.RULE("exprSubExpr", (stack) => {
			$.CONSUME(tokens.OpenParent);
			const expValue = $.SUBRULE($.expr, { ARGS: [stack] });
			$.CONSUME(tokens.CloseParent);
			return expValue;
		});
	}
}
