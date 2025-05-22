import type { SpriteSheet } from "gamer2d/game/Spritesheet";

export function buildSpritesheetFile(spritesheet: SpriteSheet, imagePath: string) {
	if (!spritesheet) return;
	let script = `spritesheet "${spritesheet.name}" {\n`;
	script += `\timage "${imagePath}"\n`;

	script += "\n";

	script += "\tsprites {\n";
	let currentSprite: string | undefined = undefined;
	for (const [name, canvas] of spritesheet.sprites) {
		const sprite = name.replace(/-\d+$/, "");
		if (currentSprite !== sprite) {
			if (currentSprite) script += "\t\t\t}\n";
			script += `\t\t"${sprite}" {\n`;
			script += "\t\t\trects {\n";
			currentSprite = sprite;
		}
		if (canvas[0]) script += `\t\t\t\t [0,0,${canvas[0].width},${canvas[0].height}]\n`;
	}
	script += "\t}\n";

	script += "\n";

	script += "\tanimations {\n";
	for (const [name, anim] of spritesheet.animations) {
		const sprite = anim.frames[0].replace(/-\d+$/, "");
		const loop = anim.loop !== Number.POSITIVE_INFINITY ? `loop ${anim.loop}` : "";
		script += `\t\t"${name}" { length ${anim.len} frames "${sprite}" ${loop} range:0,${anim.frames.length - 1} }\n`;
	}
	script += "\t}\n";

	script += "}\n";
	const blob = new Blob([script], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${spritesheet.name}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}
