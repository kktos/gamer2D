import type { NeatParser } from "../parser";

export function parseScene(parser: NeatParser) {
	const sceneType = parser.consume("IDENTIFIER").value;
	const sceneName = parser.consume("STRING").value;
	const data = parser.invokeRule(`scene_${sceneType}`);
	return { type: sceneType, name: sceneName, data };
}
