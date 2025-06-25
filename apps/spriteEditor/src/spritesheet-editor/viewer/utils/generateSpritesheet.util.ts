import type { SpriteSheet } from "gamer2d/game/Spritesheet";

export function buildSpritesheetFile(spritesheet: SpriteSheet, imagePath: string) {
	if (!spritesheet) return;
	let script = `spritesheet "${spritesheet.name}" {\n`;
	script += `\timage "${imagePath}"\n`;

	script += "\n";

	script += "\tsprites {\n";
	let currentSprite: string | undefined;
	let gridWidth = 0;
	let gridHeight = 0;
	for (const [name, sprite] of spritesheet.sprites) {
		console.log(name, sprite);

		const spriteName = name.replace(/-\d+$/, "");
		if (currentSprite !== spriteName) {
			if (currentSprite) script += "\t\t\t}\n\t\t}\n\n";

			if (gridWidth !== sprite.bounds.width || gridHeight !== sprite.bounds.height) {
				gridWidth = sprite.bounds.width;
				gridHeight = sprite.bounds.height;
				script += `\t\tgrid ${gridWidth},${gridHeight} \n`;
			}

			script += `\t\t"${spriteName}" ${sprite.scale > 1 ? `scale:${sprite.scale}` : ""} {\n`;
			script += "\t\t\trects {\n";
			currentSprite = spriteName;
		}
		script += `\t\t\t\t [${sprite.bounds.x},${sprite.bounds.y},${sprite.bounds.width},${sprite.bounds.height}]\n`;
	}
	script += "\t\t\t}\n\t\t}\n\n";
	script += "\t}\n";

	script += "\n";

	if (spritesheet.animations.size) {
		script += "\tanimations {\n";
		for (const [name, anim] of spritesheet.animations) {
			const sprite = anim.frames[0].replace(/-\d+$/, "");
			const loop = anim.loop !== Number.POSITIVE_INFINITY ? `loop ${anim.loop}` : "";
			script += `\t\t"${name}" { length ${anim.len} frames "${sprite}" ${loop} range:0,${anim.frames.length - 1} }\n`;
		}
		script += "\t}\n";
	}

	script += "}\n";
	// const blob = new Blob([script], { type: "text/plain" });
	// const url = URL.createObjectURL(blob);
	// const a = document.createElement("a");
	// a.href = url;
	// a.download = `${spritesheet.name}.txt`;
	// a.click();
	// URL.revokeObjectURL(url);
	return script;
}
