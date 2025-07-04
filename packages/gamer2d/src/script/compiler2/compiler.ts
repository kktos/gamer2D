import { NeatParser } from "./parser";
import { parseLayerBackground } from "./rules/layers/layer_background.rule";
import { parseLayerEntites } from "./rules/layers/layer_entities.rule";
import { parseLayerGlobals } from "./rules/layers/layer_globals.rule";
import { parseLayerLevel } from "./rules/layers/layer_level.rule";
import { parseLayerUi } from "./rules/layers/layer_ui.rule";
import { parseLayer } from "./rules/layers/layers.rules";
import { parseLayerWorldCollision } from "./rules/layers/worldcollision.rule";
import { parseScene } from "./rules/scene.rule";
import { parseSceneDisplay } from "./rules/scenes/scene_display.rule";
import { parseSceneGame } from "./rules/scenes/scene_game.rule";
import { parseSceneLevel } from "./rules/scenes/scene_level.rule";
import { parseVariableAssignment } from "./rules/shared/assign.rule";
import { parseSettings } from "./rules/shared/settings.rule";
import { parseStatementsBlock } from "./rules/shared/statements.rule";
import { parseValueExpression } from "./rules/shared/value-expr.rule";

export function compile<T>(text: string, startRule: string, _globals?: Map<string, unknown>, _options?: unknown) {
	const parser = new NeatParser();

	parser.addRule("expression", parseValueExpression);
	parser.addRule("assign", parseVariableAssignment);
	parser.addRule("statements", parseStatementsBlock);
	parser.addRule("settings", parseSettings);

	parser.addRule("scene", parseScene);
	parser.addRule("layer", parseLayer);

	parser.addRule("scene_display", parseSceneDisplay);
	parser.addRule("scene_level", parseSceneLevel);
	parser.addRule("scene_game", parseSceneGame);

	parser.addRule("layer_background", parseLayerBackground);
	parser.addRule("layer_globals", parseLayerGlobals);
	parser.addRule("layer_ui", parseLayerUi);
	parser.addRule("layer_entities", parseLayerEntites);
	parser.addRule("layer_level", parseLayerLevel);
	parser.addRule("layer_worldcollision", parseLayerWorldCollision);

	const result = parser.parse(text, startRule);
	return result as T;
}
