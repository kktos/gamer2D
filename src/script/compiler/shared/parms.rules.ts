import { Trait } from "../../../traits/Trait";
import { DIRECTIONS } from "../../../types/direction.type";
import { ArgVariable, ValueTrait } from "../../../types/value.types";
import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ParmsRules {
	static parm_traits($) {
		return $.RULE("parm_traits", () => {
			$.CONSUME(tokens.Traits);
			$.CONSUME(tokens.Colon);
			return $.OR([
				{
					ALT: () => {
						const traitsList: unknown[] = [];
						$.CONSUME(tokens.OpenBracket);
						$.MANY_SEP({
							SEP: tokens.Comma,
							DEF: () =>
								$.OR2([
									// { ALT: () => traitsList.push($.SUBRULE($.layoutActionFunctionCallList, { ARGS: [{ noSystem: true }] })) },
									{ ALT: () => traitsList.push($.SUBRULE($.layoutSetTrait)) },

									{
										ALT: () => {
											const traits: ArgVariable = $.SUBRULE($.definedVariable);
											$.ACTION(() => checkIfTraitVariable($, traits));
											traitsList.push(traits);
										},
									},
								]),
						});
						$.CONSUME(tokens.CloseBracket);
						return traitsList;
					},
				},
				{
					ALT: () => {
						const traits: ArgVariable = $.SUBRULE2($.definedVariable);
						$.ACTION(() => checkIfArrayTraitVariable($, traits));
						return traits;
					},
				},
			]);
		});
	}

	static parm_at($) {
		return $.RULE("parm_at", () => {
			$.CONSUME(tokens.At);
			$.CONSUME(tokens.Colon);
			return $.SUBRULE($.tupleExpr);
		});
	}

	static parm_range($) {
		return $.RULE("parm_range", () => {
			$.CONSUME(tokens.Range);
			$.CONSUME(tokens.Colon);
			return $.SUBRULE($.tupleExpr);
		});
	}

	static parm_dir($) {
		return $.RULE("parm_dir", () => {
			$.CONSUME(tokens.Dir);
			$.CONSUME(tokens.Colon);

			return $.OR([
				{
					ALT: () => {
						$.CONSUME(tokens.Left);
						return DIRECTIONS.LEFT;
					},
				},
				{
					ALT: () => {
						$.CONSUME(tokens.Right);
						return DIRECTIONS.RIGHT;
					},
				},
			]);
		});
	}

	//TODO: use expr instead of numOrVar
	static parm_width($) {
		return $.RULE("parm_width", () => {
			$.CONSUME(tokens.Width);
			$.CONSUME(tokens.Colon);
			return $.SUBRULE($.numOrVar);
		});
	}

	//TODO: use expr instead of numOrVar
	static parm_height($) {
		return $.RULE("parm_height", () => {
			$.CONSUME(tokens.Height);
			$.CONSUME(tokens.Colon);
			return $.SUBRULE($.numOrVar);
		});
	}
}

function throwIfVarsAreNotTraits($, vars: ArgVariable[]) {
	for (const value of vars) {
		if (!(value instanceof ArgVariable)) throw new TypeError(`This "${value}" is not a variable`);
		const varName = (value as ArgVariable).value;
		if (!$.variablesDict.has(varName)) throw new TypeError(`Unknown variable "${varName}"`);
		const varValue = $.variablesDict.get(varName);
		if (!(varValue instanceof ValueTrait || varValue instanceof Trait)) throw new TypeError(`Variable "${varName}" is not a trait`);
	}
}

function checkIfTraitVariable($, traits) {
	const varName = traits.value;
	if (!$.variablesDict.has(varName)) throw new TypeError(`Trait:Unknown variable "${varName}"`);
	return varName;
}
function checkIfArrayTraitVariable($, traits) {
	const varName = checkIfTraitVariable($, traits);
	const varValue = $.variablesDict.get(varName);
	if (!Array.isArray(varValue)) throw new TypeError(`Variable "${varName}" is not an array of traits`);
	throwIfVarsAreNotTraits($, varValue);
}
