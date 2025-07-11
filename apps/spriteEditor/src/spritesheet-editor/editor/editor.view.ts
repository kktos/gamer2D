import { clampPointInRect, ptInRect, type Rect } from "gamer2d";
import type { Anim } from "gamer2d/game/Anim";
import { SpriteSheet } from "gamer2d/game/Spritesheet";
import { FloatingWindowElement } from "gamer2d/inspectors/elements/floating-window.element";
import { View } from "gamer2d/layers/display/views/View";
import type { ViewContext } from "gamer2d/layers/display/views/View.factory";
import { compile } from "gamer2d/script/compiler/compiler";
import type { TSpriteSheet } from "gamer2d/script/compiler/ressources/spritesheet.rules";
import { getImgData } from "gamer2d/utils/canvas.utils";
import { loadText } from "gamer2d/utils/loaders.util";
import { createCanvasFromRect } from "../../sprites.util.js";
import { detectSprites } from "../../sprites-claude.util.js";
import { selectedAnim, sourceImage, spritesheetSourceText } from "../shared/main.store.js";
import propTemplate from "./editor.template.html?raw";
import { AnimsDlg } from "./elements/animsDlg.element.js";
import { ScriptDlg } from "./elements/scriptDlg.element.js";
import { SpriteDlg } from "./elements/spriteDlg.element.js";
import { SpritesDetectorDlg } from "./elements/spritesDetectorDlg.element.js";
import { TabsContainer } from "./elements/tabs.element.js";
import { throttledUpdatePixelColor } from "./helpers/pick-color.helper.js";
import { zoomImage } from "./helpers/zoom.helper.js";
import toolsTemplate from "./tools.template.html?raw";
import { newWindow, setupUi } from "./ui.setup.js";

const INFO_PANEL_WIDTH = 75;
const INFO_PANEL_HEIGHT = 15;
const AREA_PANEL_WIDTH = 85;

const CMD_SELECT = 1;
const CMD_MOVE = 2;
const CMD_MOVING = 3;
const CMD_SELECTING = 4;
const CMD_MOVING_SELECTION = 5;
const CMD_PICK_COLOR = 6;
type TCMD = typeof CMD_MOVE | typeof CMD_SELECT | typeof CMD_MOVING | typeof CMD_SELECTING | typeof CMD_MOVING_SELECTION | typeof CMD_PICK_COLOR;

export class SpritesheetEditorView extends View {
	static EVENT_SPRITESHEET_LOADED = Symbol.for("SPRITESHEET_LOADED");
	static EVENT_ANIM_CREATE = Symbol.for("ANIM_CREATE");
	static EVENT_SPRITE_CREATE = Symbol.for("SPRITE_CREATE");
	static EVENT_SPRITE_RENAME = Symbol.for("SPRITE_RENAME");
	static EVENT_GENERATE_SPRITESHEET = Symbol.for("GENERATE_SPRITESHEET");

	public srcImageData!: ImageData;
	private sheet: TSpriteSheet | undefined;

	public imageOffsetX: number;
	public imageOffsetY: number;
	private lastMouseX: number;
	private lastMouseY: number;
	public zoom: number;
	private backgroundPattern: CanvasPattern;
	private capturedArea: Rect | null;
	private cmd: TCMD;
	private previousCmd: TCMD;
	private contentElement!: HTMLElement;
	private filename!: string;
	private propsWindow!: FloatingWindowElement;

	constructor(ctx: ViewContext) {
		super(ctx);

		this.buildUI();

		// this.srcImage = undefined;
		this.imageOffsetX = 0;
		this.imageOffsetY = 0;
		this.lastMouseX = 0;
		this.lastMouseY = 0;
		this.zoom = 1;
		this.backgroundPattern = this.createBackgroundPattern();
		this.capturedArea = null;
		this.cmd = CMD_MOVE;
		this.previousCmd = this.cmd;
	}

	destroy() {}

	buildUI() {
		FloatingWindowElement.bootstrap();
		TabsContainer.bootstrap();
		ScriptDlg.bootstrap();
		SpritesDetectorDlg.bootstrap();
		AnimsDlg.bootstrap();
		SpriteDlg.bootstrap();

		const rootElement = document.createElement("div");
		document.body.appendChild(rootElement);
		rootElement.className = "root-editor";

		const cmdWindow = newWindow(" ", "commands", 5, 260, 40, 274);
		this.contentElement = document.createElement("div");
		this.contentElement.innerHTML = toolsTemplate;
		this.contentElement.className = "layout tools";
		cmdWindow.setContent(this.contentElement);
		cmdWindow.restoreState();
		cmdWindow.setMode("tool");

		rootElement.appendChild(cmdWindow);
		setupUi(cmdWindow.getContentElement(), (id: string, data?: unknown) => this.onClickUIBtn(id, data));

		this.propsWindow = newWindow("Props", "props", document.body.clientWidth - 450 - 10, document.body.clientHeight - 650 - 10, 450, 650);
		this.contentElement = document.createElement("div");
		this.contentElement.innerHTML = propTemplate;
		this.contentElement.className = "layout props";
		this.propsWindow.setContent(this.contentElement);
		this.propsWindow.minimizable = true;
		this.propsWindow.resizable = true;
		this.propsWindow.restoreState();
		rootElement.appendChild(this.propsWindow);
		setupUi(this.propsWindow.getContentElement(), (id: string, data?: unknown) => this.onClickUIBtn(id, data));

		const tabs = this.propsWindow.getContentElement().querySelector("tabs-container") as TabsContainer;
		selectedAnim.subscribe(() => tabs.activateTab("anims-tab"));
	}

	onChangeUI(_el: HTMLInputElement | HTMLSelectElement) {}

	onClickUIBtn(id: string, data?: unknown) {
		switch (id) {
			case "open-image":
				this.openImage();
				break;
			case "open-spritesheet":
				this.openSpriteSheet();
				break;
			case "new-spritesheet":
				this.newSpriteSheet();
				break;
			case "compile-script":
				this.compileSpritesheet(data);
				break;
			case "move-cmd":
				this.cmdMove();
				break;
			case "select-cmd":
				this.cmdSelect();
				break;
			case "pick-color-cmd":
				this.cmdPickColor();
				break;
			case "save-anim": {
				if (!data) return;
				this.layer.scene.emit(SpritesheetEditorView.EVENT_ANIM_CREATE, data);
				break;
			}
			case "save-sprite": {
				if (!data) return;
				this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITE_RENAME, (data as { name: string }).name);
				break;
			}
			case "detect-sprites": {
				if (!data) return;
				this.findSpritesOnCanvas(data);
				break;
			}
			case "gen-spritesheet": {
				this.layer.scene.emit(SpritesheetEditorView.EVENT_GENERATE_SPRITESHEET);
				break;
			}
		}
	}

	handleEvent(gc, e) {
		if (!sourceImage.value) return;

		switch (e.type) {
			case "keyup":
				this.handleKey(gc, e);
				break;

			case "wheel":
				if (gc.keys.isPressed("Control")) zoomImage(this, e);
				else this.offsetImage(0, e.deltaY);
				break;

			case "mousedown":
				if (e.buttons !== 1) return;

				this.lastMouseX = e.x;
				this.lastMouseY = e.y;

				if (this.capturedArea && ptInRect(e.x / this.zoom - this.imageOffsetX, e.y / this.zoom - this.imageOffsetY, this.capturedArea)) {
					this.previousCmd = this.cmd;
					this.cmd = CMD_MOVING_SELECTION;
					gc.viewport.canvas.style.cursor = "move";
					return;
				}

				switch (this.cmd) {
					case CMD_MOVE: {
						if (sourceImage.value.width * this.zoom > this.canvas.width || sourceImage.value.height * this.zoom > this.canvas.height) {
							if (e.x >= 0 && e.x <= this.canvas.width && e.y >= 0 && e.y <= this.canvas.height) {
								this.cmd = CMD_MOVING;
							}
						}
						break;
					}
					case CMD_SELECT: {
						this.cmd = CMD_SELECTING;
						this.capturedArea = { x: e.x / this.zoom - this.imageOffsetX + 0.5, y: e.y / this.zoom - this.imageOffsetY + 0.5, width: 0, height: 0 };
						break;
					}
				}
				break;

			case "mousemove": {
				switch (this.cmd) {
					case CMD_MOVING:
						return this.handleMoving(gc, e);
					case CMD_SELECTING:
						return this.handleSelecting(e);
					case CMD_MOVING_SELECTION:
						return this.handleMovingSelection(e);
					case CMD_MOVE:
					case CMD_SELECT: {
						if (this.capturedArea && ptInRect(e.x / this.zoom - this.imageOffsetX, e.y / this.zoom - this.imageOffsetY, this.capturedArea)) {
							gc.viewport.canvas.style.cursor = "move";
							this.lastMouseX = this.capturedArea.x;
							this.lastMouseY = this.capturedArea.y;
							return;
						}
						break;
					}
					case CMD_PICK_COLOR: {
						throttledUpdatePixelColor(this, e);
						break;
					}
				}

				this.lastMouseX = e.x;
				this.lastMouseY = e.y;

				// gc.viewport.canvas.style.cursor = this.cmd === CMD_MOVE ? "grab" : "crosshair";
				// Cursor is primarily set by cmd<Action>() methods or specific states like CMD_MOVING.
				// This ensures the base cursor for the mode is active if not overridden.
				const currentCanvasCursor = gc.viewport.canvas.style.cursor;
				if (currentCanvasCursor !== "grabbing" && currentCanvasCursor !== "move") {
					if (this.cmd === CMD_MOVE) gc.viewport.canvas.style.cursor = "grab";
					else if (this.cmd === CMD_SELECT) gc.viewport.canvas.style.cursor = "crosshair";
					else if (this.cmd === CMD_PICK_COLOR) gc.viewport.canvas.style.cursor = "none";
				}
				break;
			}

			case "mouseup":
				switch (this.cmd) {
					case CMD_MOVING:
						// gc.viewport.canvas.style.cursor = "default";
						this.cmd = CMD_MOVE;
						break;
					case CMD_SELECTING:
						this.cmd = CMD_SELECT;
						if (this.capturedArea) {
							if (this.capturedArea?.width < 0) {
								this.capturedArea.x += this.capturedArea.width;
								this.capturedArea.width = -this.capturedArea.width;
							}
							if (this.capturedArea?.height < 0) {
								this.capturedArea.y += this.capturedArea.height;
								this.capturedArea.height = -this.capturedArea.height;
							}
						}
						break;
					case CMD_MOVING_SELECTION:
						this.cmd = this.previousCmd;
						break;
					case CMD_PICK_COLOR:
						this.cmd = this.previousCmd;
						break;
				}
				break;
		}
	}

	handleKey(gc, e) {
		if (!this.capturedArea) return;
		switch (e.key) {
			case "ArrowLeft": {
				if (gc.keys.isPressed("Shift")) {
					this.capturedArea.width -= 1;
				} else this.capturedArea.x -= 1;
				break;
			}
			case "ArrowRight": {
				if (gc.keys.isPressed("Shift")) {
					this.capturedArea.width += 1;
				} else this.capturedArea.x += 1;
				break;
			}
			case "ArrowUp": {
				if (gc.keys.isPressed("Shift")) {
					this.capturedArea.height -= 1;
				} else this.capturedArea.y -= 1;

				break;
			}
			case "ArrowDown": {
				if (gc.keys.isPressed("Shift")) {
					this.capturedArea.height += 1;
				} else this.capturedArea.y += 1;
				break;
			}
			case "Escape":
				this.capturedArea = null;
				break;
		}
	}

	handleMoving(gc, e) {
		if (!sourceImage.value) return;

		gc.viewport.canvas.style.cursor = "grabbing";

		const deltaX = e.x - this.lastMouseX;
		const deltaY = e.y - this.lastMouseY;

		this.offsetImage(deltaX, deltaY);

		this.lastMouseX = e.x;
		this.lastMouseY = e.y;
	}

	handleSelecting(e) {
		if (!this.capturedArea) return;
		if (e.x >= this.canvas.width - 5) this.offsetImage(-5, 0);
		if (e.y >= this.canvas.height - 5) this.offsetImage(0, -5);

		this.capturedArea.width = e.x / this.zoom - this.imageOffsetX - this.capturedArea.x + 0.5;
		this.capturedArea.height = e.y / this.zoom - this.imageOffsetY - this.capturedArea.y + 0.5;
	}

	handleMovingSelection(e) {
		if (!this.capturedArea) return;
		const deltaX = e.x - this.lastMouseX;
		const deltaY = e.y - this.lastMouseY;
		this.capturedArea.x += deltaX;
		this.capturedArea.y += deltaY;
		this.lastMouseX = e.x;
		this.lastMouseY = e.y;
	}

	offsetImage(deltaX: number, deltaY: number) {
		if (!sourceImage.value) return;

		if (sourceImage.value.width * this.zoom > this.canvas.width) {
			this.imageOffsetX += deltaX / this.zoom;
			const minOffsetX = this.canvas.width - sourceImage.value.width * this.zoom;
			this.imageOffsetX = Math.max(minOffsetX / this.zoom, Math.min(0, this.imageOffsetX));
		}

		if (sourceImage.value.height * this.zoom > this.canvas.height) {
			this.imageOffsetY += deltaY / this.zoom;
			const minOffsetY = this.canvas.height - sourceImage.value.height * this.zoom;
			this.imageOffsetY = Math.max(minOffsetY / this.zoom, Math.min(0, this.imageOffsetY));
		}
	}

	cmdMove() {
		this.cmd = CMD_MOVE;
	}

	cmdSelect() {
		this.cmd = CMD_SELECT;
	}

	cmdPickColor() {
		this.cmd = CMD_PICK_COLOR;
	}

	public selectSprite(_name: string) {
		// const foundSprite = this.sheet?.sprites.filter((sprite) => {
		// 	if (!("name" in sprite)) return false;
		// 	if (sprite.name === name) return true;
		// 	if (sprite.name === name.replace(/-\d+$/, "")) return true;
		// });
	}

	public selectAnim(_animDef: { name: string; anim: Anim }) {
		// if (!animDef.anim) return;
		// selectedAnim.value = animDef;
	}

	async openImage() {
		const pickerOpts = {
			types: [
				{
					description: "Images",
					accept: {
						"image/*": [".png", ".gif", ".jpeg", ".jpg"],
					},
				},
			],
			excludeAcceptAllOption: true,
			multiple: false,
		};

		const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
		const file = await fileHandle.getFile();

		this.filename = file.name;

		spritesheetSourceText.value = spritesheetSourceText.value?.replace(/image\s+"([^"]+)"/, `image "images/${this.filename}"`);

		const blob = await file.arrayBuffer();
		return new Promise<string>((resolve) => {
			const img = new Image();
			img.src = URL.createObjectURL(new Blob([blob]));
			img.onload = () => {
				sourceImage.value = img;
				this.srcImageData = getImgData(img);
				this.zoom = 1;
				this.capturedArea = null;
				resolve(`images/${this.filename}`);
			};
		});
	}

	async openSpriteSheet() {
		const pickerOpts = {
			types: [
				{
					description: "SpriteSheets",
					accept: {
						"application/json": [".json"],
						"application/octet-stream": [".script"],
					},
				},
			],
			excludeAcceptAllOption: true,
			multiple: false,
		};

		const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
		const file = await fileHandle.getFile();
		const text = await file.text();

		if (file.type === "application/json") {
			this.sheet = JSON.parse(text);
			if (!this.sheet) return;
			const ss = await SpriteSheet.loadData(this.sheet);
			if (ss.img) {
				sourceImage.value = ss.img;
				this.srcImageData = getImgData(ss.img as HTMLImageElement);
				this.zoom = 1;
				this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, { ss, image: this.sheet.image });
			}
		} else {
			// this.scriptElement.value = text;
			spritesheetSourceText.value = text;

			const ssSource = await loadText(`spritesheets/${file.name}`);
			this.sheet = compile<TSpriteSheet>(ssSource, "spriteSheet");

			const ss = await SpriteSheet.loadData(this.sheet);
			if (ss.img) {
				sourceImage.value = ss.img;
				this.srcImageData = getImgData(ss.img as HTMLImageElement);
				this.zoom = 1;
				this.capturedArea = null;
				this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, { ss, image: this.sheet.image });
			}
		}
	}

	async newSpriteSheet() {
		let imagePath = this.filename;
		if (!sourceImage.value) imagePath = await this.openImage();
		if (!sourceImage.value) return;

		const ss = new SpriteSheet("????", sourceImage.value);
		this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, { ss, image: imagePath });

		const text = ['spritesheet "????" {', "", `    image "${imagePath}"`, "", "}"].join("\n");
		spritesheetSourceText.value = text;
	}

	private compileSpritesheet(data) {
		this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, data);
	}

	private findSpritesOnCanvas(options) {
		if (!sourceImage.value || !this.capturedArea) return;

		let name = options.name.trim();
		if (name.length === 0) name = "sprite";

		const gridW = options.width;
		const gridH = options.height;

		const single = (foundRects) => {
			const output: string[] = [`"${name}" scale:${options.scale}{`, "    rects {"];
			for (const rect of foundRects) output.push(`        [${rect.x + this.capturedArea?.x},${rect.y + this.capturedArea?.y},${rect.width},${rect.height}]`);
			output.push("    }");
			output.push("}");
			return output;
		};

		const multiple = (foundRects) => {
			const output: string[] = [];
			let idx = 0;
			for (const rect of foundRects) {
				output.push(
					`"${name}-${idx}" scale:${options.scale} { rect [${rect.x + this.capturedArea?.x},${rect.y + this.capturedArea?.y},${rect.width},${rect.height}] }`,
				);
				idx++;
			}
			return output;
		};

		this.capturedArea.x = Math.floor(this.capturedArea.x);
		this.capturedArea.y = Math.floor(this.capturedArea.y);
		const capturedArea = createCanvasFromRect(sourceImage.value, this.capturedArea);
		if (capturedArea) {
			console.log(
				"%c                                                                                              ",
				`font-size:${capturedArea.height}px; background:url(${capturedArea.toDataURL()}) no-repeat;`,
			);

			const detectOptions = {
				minWidth: options.minWidth,
				minHeight: options.minHeight,
				backgroundColor: options.bgcolor,
				toleranceRGB: options.toleranceRGB,
				toleranceAlpha: options.toleranceAlpha,
			};

			// console.log("detectOptions", detectOptions);

			const foundRects = detectSprites(options.method, capturedArea, detectOptions);

			let output: string[] = [];
			switch (options.mode) {
				case "single":
					output = single(foundRects);
					break;
				case "multiple":
					output = multiple(foundRects);
					break;
			}
			const script = `
			sprites {
				grid ${gridW},${gridH}
				${output.join("\n")}
			}
			`;
			const sheet = compile(script, "spriteSheetSprites");
			// console.log(script, sheet);
			this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITE_CREATE, sheet);
		}
	}

	private createBackgroundPattern(): CanvasPattern {
		const patternSquareSize = 5; // Size of each individual square in the pattern
		const tileWidth = patternSquareSize * 2; // 2 squares wide
		const tileHeight = patternSquareSize * 2; // 2 squares high

		const offscreenCanvas = document.createElement("canvas");
		offscreenCanvas.width = tileWidth;
		offscreenCanvas.height = tileHeight;

		const offscreenCtx = offscreenCanvas.getContext("2d") as CanvasRenderingContext2D;

		// (0,0) -> (0+0)%2 = 0 -> #BBB
		offscreenCtx.fillStyle = "#BBB";
		offscreenCtx.fillRect(0, 0, patternSquareSize, patternSquareSize);
		offscreenCtx.fillRect(patternSquareSize, patternSquareSize, patternSquareSize, patternSquareSize);

		// (0,1) -> (0+1)%2 = 1 -> #888
		offscreenCtx.fillStyle = "#888";
		offscreenCtx.fillRect(patternSquareSize, 0, patternSquareSize, patternSquareSize);
		offscreenCtx.fillRect(0, patternSquareSize, patternSquareSize, patternSquareSize);

		return this.ctx.createPattern(offscreenCanvas, "repeat") as CanvasPattern;
	}

	centerIfSmaller(width: number, height: number) {
		if (!sourceImage.value) return [0, 0];
		// const xPos = width > this.canvas.width ? this.imageOffsetX : (this.canvas.width - width) / 2 / this.zoom;
		// const yPos = height > this.canvas.height ? this.imageOffsetY : (this.canvas.height - height) / 2 / this.zoom;
		this.imageOffsetX = width > this.canvas.width ? this.imageOffsetX : (this.canvas.width - width) / 2 / this.zoom;
		this.imageOffsetY = height > this.canvas.height ? this.imageOffsetY : (this.canvas.height - height) / 2 / this.zoom;
		return [this.imageOffsetX, this.imageOffsetY];
	}

	render(gc) {
		this.ctx.fillStyle = this.backgroundPattern;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		if (sourceImage.value) {
			this.ctx.save();
			this.ctx.scale(this.zoom, this.zoom);
			const width = sourceImage.value.width * this.zoom;
			const height = sourceImage.value.height * this.zoom;
			const [xPos, yPos] = this.centerIfSmaller(width, height);

			this.ctx.fillStyle = "black";
			this.ctx.fillRect(xPos, yPos, sourceImage.value.width, sourceImage.value.height);
			this.ctx.drawImage(sourceImage.value, xPos, yPos);
			this.ctx.restore();

			const panelWidth = INFO_PANEL_WIDTH + (this.capturedArea ? AREA_PANEL_WIDTH : 0);
			this.ctx.fillStyle = "rgb(0 0 0 / 70%)";
			this.ctx.fillRect(this.canvas.width - panelWidth, this.canvas.height - INFO_PANEL_HEIGHT, panelWidth, INFO_PANEL_HEIGHT);
			this.ctx.strokeStyle = "rgb(255 255 255 / 50%)";
			this.ctx.strokeRect(this.canvas.width - panelWidth - 1 + 0.5, this.canvas.height - INFO_PANEL_HEIGHT - 1 + 0.5, panelWidth + 1, INFO_PANEL_HEIGHT + 1);

			this.ctx.textAlign = "right";
			this.ctx.fillStyle = "#fff";

			if (this.capturedArea) {
				this.ctx.strokeStyle = "#fff";
				this.ctx.setLineDash([4, 2]);
				this.ctx.lineDashOffset = this.ctx.lineDashOffset + gc.dt * 10;
				const prevCompositeOp = this.ctx.globalCompositeOperation;
				this.ctx.globalCompositeOperation = "difference";
				this.ctx.strokeRect(
					this.capturedArea.x * this.zoom + this.imageOffsetX * this.zoom, // / this.zoom - this.imageOffsetX,
					this.capturedArea.y * this.zoom + this.imageOffsetY * this.zoom, // / this.zoom - this.imageOffsetY,
					this.capturedArea.width * this.zoom,
					this.capturedArea.height * this.zoom,
				);
				this.ctx.globalCompositeOperation = prevCompositeOp;
				this.ctx.setLineDash([]);
				this.ctx.fillText(
					`[${Math.floor(this.capturedArea.x)},${Math.floor(this.capturedArea.y)},${Math.floor(this.capturedArea.width)},${Math.floor(this.capturedArea.height)}]`,
					this.canvas.width - INFO_PANEL_WIDTH,
					this.canvas.height - 5,
				);
			}

			const lastMousePos = { x: this.lastMouseX / this.zoom, y: this.lastMouseY / this.zoom };
			const area = { x: xPos, y: yPos, width, height };
			const mousePos = clampPointInRect(lastMousePos, area);
			this.ctx.fillText(`(${Math.floor(mousePos.x)},${Math.floor(mousePos.y)}) x${this.zoom.toPrecision(2)}`, this.canvas.width - 4, this.canvas.height - 5);

			if (this.cmd === CMD_PICK_COLOR) {
				const prevCompositeOp = this.ctx.globalCompositeOperation;
				this.ctx.globalCompositeOperation = "difference";
				const crossSize = 3;
				this.ctx.strokeStyle = "white";
				this.ctx.lineWidth = 1;
				const x = this.lastMouseX + 0.5;
				const y = this.lastMouseY + 0.5;
				this.ctx.strokeRect(x - crossSize - 1, y, crossSize, 1);
				this.ctx.strokeRect(x + 2, y, crossSize, 1);
				this.ctx.strokeRect(x, y - crossSize - 1, 1, crossSize);
				this.ctx.strokeRect(x, y + 2, 1, crossSize);
				this.ctx.globalCompositeOperation = prevCompositeOp;
			}
		}
	}
}
