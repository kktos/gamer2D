import { OP_TYPES } from "../../../../../types/operation.types";
import { tokens } from "../../../lexer";
import type { TRepeat } from "./repeat.rules";

/*
	for $idx 0,10 {
		text "%positions.$idx%" at:90,190
		text "%highscores.$idx.score%" at:250,190
		text "%highscores.$idx.round%" at:450,190
		text "%highscores.$idx.name%" at:580,190
	}
	$itemYpos = 180
	for $menuItem of $menuItems var:$idx {
		item {text $menuItem at:300,$itemYpos+50*$idx}
	}		
*/

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ForRules {
	static layoutFor($) {
		return $.RULE("layoutFor", (options, isMenuItem: boolean) => {
			const result: TRepeat = $.SUBRULE($.layoutForClause);

			const items = $.SUBRULE($.layoutRepeatItems, {
				ARGS: [options, isMenuItem],
			});

			$.ACTION(() => {
				result.items = items;
			});

			return result;
		});
	}

	static layoutForClause($) {
		return $.RULE("layoutForClause", () => {
			$.CONSUME(tokens.For);
			const result: TRepeat = { type: OP_TYPES.REPEAT, from: 0, count: 0, items: [] };
			$.OR([
				{
					// for <var> from,to
					ALT: () => {
						$.OPTION(() => {
							result.index = $.CONSUME(tokens.Variable).image.substring(1);
							$.variablesDict.set(result.index, 0);
						});

						const range = $.SUBRULE($.tupleExpr);
						result.count = range[1];
						result.from = range[0];
					},
				},
				{
					// for <var> of <arrayVar | [<string|var>]>
					ALT: () => {
						result.var = $.CONSUME2(tokens.Variable).image.substring(1);
						$.variablesDict.set(result.var, 0);
						$.CONSUME2(tokens.Of);
						result.list = $.OR2([
							{
								ALT: () => {
									const varName = $.CONSUME3(tokens.Variable).image.substring(1);
									if (!$.variablesDict.has(varName)) throw new TypeError(`Unknown variable "${varName}"`);
									return varName;
								},
							},
							{ ALT: () => $.SUBRULE($.arrayOfVarsStringsNumbers) },
						]);

						$.OPTION2(() => {
							$.CONSUME(tokens.Index);
							$.CONSUME(tokens.Colon);
							result.index = $.CONSUME4(tokens.Variable).image.substring(1);
							$.variablesDict.set(result.index, 0);
						});
					},
				},
			]);
			return result;
		});
	}
}
