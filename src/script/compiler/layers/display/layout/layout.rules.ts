import { tokens } from "../../../lexer";
import type { TAnimDef } from "./defanim.rules";
import type { TImage } from "./image.rules";
import type { TMenu, TMenuItemGroup } from "./menu.rules";
import type { TRect } from "./rect.rules";
import type { TRepeat } from "./repeat.rules";
import type { TSet } from "./set.rules";
import type { TSprite } from "./sprite.rules";
import type { TText } from "./text.rules";
import type { TView } from "./view.rules";

export type TStatement = TText | TSprite | TMenu | TRepeat | TView | TAnimDef | TSet | TImage | TRect | TMenuItemGroup;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LayoutRules {
	static layout($) {
		return $.RULE("layout", () => {
			$.CONSUME(tokens.Layout);

			$.CONSUME(tokens.OpenCurly);

			const layout: TStatement[] = [];
			const options = {};
			let lastStatement: TStatement | null = null;

			$.MANY(() => {
				const optionRule = () => {
					const { name, value, isParm } = $.SUBRULE($.textSpriteProps);
					if (isParm) {
						if (!lastStatement) throw new TypeError("Invalid parm here");
						lastStatement[name] = value;
					} else {
						options[name] = value;
					}
				};

				const statementRule = () => {
					lastStatement = $.SUBRULE($.layoutStatement, { ARGS: [options] }) as TStatement;
					layout.push(lastStatement);
				};

				$.OR([{ ALT: optionRule }, { ALT: statementRule }]);
			});

			$.CONSUME(tokens.CloseCurly);

			return { name: "layout", value: layout };
		});
	}

	static layoutStatement($) {
		return $.RULE("layoutStatement", (options) => {
			return $.OR([
				{ ALT: () => $.SUBRULE($.layoutSet, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutText, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutSprite, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutImage, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutMenu, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutFor, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutRepeat, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutView, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutRect, { ARGS: [options] }) },
				{ ALT: () => $.SUBRULE($.layoutDefAnim, { ARGS: [options] }) },
			]);
		});
	}
}
