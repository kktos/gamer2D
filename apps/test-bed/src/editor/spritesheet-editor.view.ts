import { SpriteSheet } from "gamer2d/game/Spritesheet";
import { View } from "gamer2d/layers/display/views/View";
import type { ViewContext } from "gamer2d/layers/display/views/View.factory";
import { type Rect, clampPointInRect, ptInRect } from "gamer2d/maths/math";
import { compile } from "gamer2d/script/compiler/compiler";
import { createSpriteSheet } from "gamer2d/utils/createSpriteSheet.util";
import { createCanvasFromRect, findSpritesInCanvasRect } from "../sprites.util.js";
import css from "./editor.css?raw";

const CMD_SELECT = 1;
const CMD_MOVE = 2;
const CMD_MOVING = 3;
const CMD_SELECTING = 4;
const CMD_MOVING_SELECTION = 5;
type TCMD = typeof CMD_MOVE | typeof CMD_SELECT | typeof CMD_MOVING | typeof CMD_SELECTING | typeof CMD_MOVING_SELECTION;

export class SpritesheetEditorView extends View {
	static EVENT_SPRITESHEET_LOADED = Symbol.for("SPRITESHEET_LOADED");

	private srcImage: HTMLImageElement | HTMLCanvasElement | undefined;
	private imageOffsetX: number;
	private imageOffsetY: number;
	private lastMouseX: number;
	private lastMouseY: number;
	private zoom: number;
	private backgroundPattern: CanvasPattern;
	private capturedArea: Rect | null;
	private cmd: TCMD;
	private previousCmd: TCMD;

	constructor(ctx: ViewContext) {
		super(ctx);

		this.buildUI([]);
		this.srcImage = undefined;
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

	buildUI(list: string[]) {
		// const options = list.map((item, idx) => `<option value="${idx}">${item.replace(/^[^:]+:/, "")}</option>`);
		const options = list.map((item, idx) => `<option value="${idx}">${item}</option>`);

		const scriptText = localStorage.getItem("gamer2d-script") ?? "";
		const html = `
			<style>${css}</style>
			<div class="btn-bar">
				<div id="btnOpenImage" class="btn">Open Image</div>
				<div id="btnOpenSpriteSheet" class="btn">Open SpriteSheet</div>
				<div id="btnNewSpriteSheet" class="btn">New SpriteSheet</div>
				<div id="btnDetectSprites" class="btn">Detect Sprites</div>
				<div class="sep"></div>
				<div id="btnMove" class="btn on">Move</div>
				<div id="btnSelect" class="btn">Select</div>
			</div>
			<div id="scriptEditor" class="expandPanel">
				<textarea id="script">${scriptText}</textarea>
				<div class="grid items-center"><div id="btnCompile" class="btn">Compile</div></div>
			</div>
		`;
		const contentElm = document.createElement("div");
		contentElm.innerHTML = html;
		contentElm.style.cssText = "display:grid;grid-template-rows:auto 1fr;height:100%";
		this.layer.setContent(contentElm, this);
	}

	onChangeUI(el: HTMLInputElement | HTMLSelectElement) {}

	onClickUIBtn(id: string) {
		switch (id) {
			case "btnOpenImage":
				this.openImage();
				break;
			case "btnOpenSpriteSheet":
				this.openSpriteSheet();
				break;
			case "btnNewSpriteSheet":
				this.newSpriteSheet();
				break;
			case "btnCompile":
				this.compile();
				break;
			case "btnMove": {
				this.cmd = CMD_MOVE;
				const content = this.layer.getContent();
				const btnMove = content?.querySelector("#btnMove");
				btnMove?.classList.add("on");
				const btnSelect = content?.querySelector("#btnSelect");
				btnSelect?.classList.remove("on");
				break;
			}
			case "btnSelect": {
				this.cmd = CMD_SELECT;
				const content = this.layer.getContent();
				const btnMove = content?.querySelector("#btnSelect");
				btnMove?.classList.add("on");
				const btnSelect = content?.querySelector("#btnMove");
				btnSelect?.classList.remove("on");
				break;
			}
			case "btnDetectSprites": {
				this.detectSprites();
				break;
			}
			case "btnExpand": {
				const content = this.layer.getContent();
				const scriptEditor = content?.querySelector("#scriptEditor");
				scriptEditor?.classList.toggle("expanded");
				break;
			}
		}
	}

	handleEvent(gc, e) {
		if (!this.srcImage) return;
		switch (e.type) {
			case "wheel":
				this.zoom += e.deltaY * 0.001;
				this.zoom = Math.min(this.zoom, 10);
				this.zoom = Math.max(this.zoom, 1);
				this.zoom = Math.floor(this.zoom * 10) / 10;
				break;

			case "mousedown":
				if (e.buttons !== 1) return;

				this.lastMouseX = e.x;
				this.lastMouseY = e.y;

				if (this.capturedArea && ptInRect(e.x, e.y, this.capturedArea)) {
					this.previousCmd = this.cmd;
					this.cmd = CMD_MOVING_SELECTION;
					gc.viewport.canvas.style.cursor = "move";
					return;
				}

				switch (this.cmd) {
					case CMD_MOVE: {
						if (this.srcImage.width * this.zoom > this.canvas.width || this.srcImage.height * this.zoom > this.canvas.height) {
							if (e.x >= 0 && e.x <= this.canvas.width && e.y >= 0 && e.y <= this.canvas.height) {
								this.cmd = CMD_MOVING;
							}
						}
						break;
					}
					case CMD_SELECT: {
						this.cmd = CMD_SELECTING;
						this.capturedArea = { x: e.x + 0.5, y: e.y + 0.5, width: 0, height: 0 };
						break;
					}
				}
				break;

			case "mousemove":
				switch (this.cmd) {
					case CMD_MOVING:
						return this.handleMoving(gc, e);
					case CMD_SELECTING:
						return this.handleSelecting(gc, e);
					case CMD_MOVING_SELECTION:
						return this.handleMovingSelection(gc, e);
					case CMD_MOVE:
					case CMD_SELECT:
						if (this.capturedArea && ptInRect(e.x, e.y, this.capturedArea)) {
							gc.viewport.canvas.style.cursor = "move";
							this.lastMouseX = this.capturedArea.x;
							this.lastMouseY = this.capturedArea.y;
							return;
						}
						break;
				}

				this.lastMouseX = e.x;
				this.lastMouseY = e.y;

				gc.viewport.canvas.style.cursor = this.cmd === CMD_MOVE ? "grab" : "crosshair";
				break;

			case "mouseup":
				switch (this.cmd) {
					case CMD_MOVING:
						gc.viewport.canvas.style.cursor = "default";
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
				}
				break;
		}
	}

	handleMoving(gc, e) {
		if (!this.srcImage) return;

		gc.viewport.canvas.style.cursor = "grabbing";

		const deltaX = e.x - this.lastMouseX;
		const deltaY = e.y - this.lastMouseY;

		if (this.srcImage.width * this.zoom > this.canvas.width) {
			this.imageOffsetX += deltaX / this.zoom;
			const minOffsetX = this.canvas.width - this.srcImage.width * this.zoom;
			this.imageOffsetX = Math.max(minOffsetX / this.zoom, Math.min(0, this.imageOffsetX));
		}

		if (this.srcImage.height * this.zoom > this.canvas.height) {
			this.imageOffsetY += deltaY / this.zoom;
			const minOffsetY = this.canvas.height - this.srcImage.height * this.zoom;
			this.imageOffsetY = Math.max(minOffsetY / this.zoom, Math.min(0, this.imageOffsetY));
		}

		this.lastMouseX = e.x;
		this.lastMouseY = e.y;
	}

	handleSelecting(gc, e) {
		if (!this.capturedArea) return;
		this.capturedArea.width = e.x - this.capturedArea.x + 0.5;
		this.capturedArea.height = e.y - this.capturedArea.y + 0.5;
	}

	handleMovingSelection(gc, e) {
		if (!this.capturedArea) return;
		const deltaX = e.x - this.lastMouseX;
		const deltaY = e.y - this.lastMouseY;
		this.capturedArea.x += deltaX;
		this.capturedArea.y += deltaY;
		this.lastMouseX = e.x;
		this.lastMouseY = e.y;
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
		const blob = await file.arrayBuffer();
		return new Promise((resolve) => {
			const img = new Image();
			img.src = URL.createObjectURL(new Blob([blob]));
			img.onload = () => {
				this.srcImage = img;
				this.zoom = 1;
				resolve(true);
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
		// console.log(file);
		if (file.type === "application/json") {
			const json = JSON.parse(text);
			const ss = await SpriteSheet.loadData(json);
			if (ss.img) {
				this.srcImage = ss.img;
				this.zoom = 1;
				this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, ss);
			}
		} else {
			const content = this.layer.getContent();
			const scriptElement = content?.querySelector("#script") as HTMLTextAreaElement;
			scriptElement.value = text;

			const ss = await SpriteSheet.loadScript(`spritesheets/${file.name}`);
			if (ss.img) {
				this.srcImage = ss.img;
				this.zoom = 1;
				this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, ss);
			}
		}
	}

	async newSpriteSheet() {
		await this.openImage();
		if (!this.srcImage) return;
		const ss = new SpriteSheet("????", this.srcImage);
		this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, ss);
	}

	private compile() {
		if (!this.srcImage) return;

		const content = this.layer.getContent();
		const scriptElement = content?.querySelector("#script") as HTMLTextAreaElement;
		const script = scriptElement?.value;
		if (script) {
			localStorage.setItem("gamer2d-script", script);
			const sheet = compile(script, "spriteSheet");
			const ss = createSpriteSheet(sheet, this.srcImage);
			this.layer.scene.emit(SpritesheetEditorView.EVENT_SPRITESHEET_LOADED, ss);
		}
	}

	private detectSprites() {
		if (!this.srcImage || !this.capturedArea) return;
		this.capturedArea.x = Math.floor(this.capturedArea.x);
		this.capturedArea.y = Math.floor(this.capturedArea.y);
		const capturedArea = createCanvasFromRect(this.srcImage, this.capturedArea);
		if (capturedArea) {
			const foundRects = findSpritesInCanvasRect(capturedArea, { x: 0, y: 0, width: capturedArea.width, height: capturedArea.height });
			let idx = 0;
			const output: string[] = [];
			for (const rect of foundRects) {
				output.push(`item${idx} { rect [${rect.x + this.capturedArea.x},${rect.y + this.capturedArea.y},${rect.width},${rect.height}] }`);
				idx++;
			}
			console.log(output.join("\n"));
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
		if (!this.srcImage) return [0, 0];
		const xPos = width > this.canvas.width ? this.imageOffsetX : (this.canvas.width - width) / 2 / this.zoom;
		const yPos = height > this.canvas.height ? this.imageOffsetY : (this.canvas.height - height) / 2 / this.zoom;
		return [xPos, yPos];
	}

	render(gc) {
		this.ctx.fillStyle = this.backgroundPattern;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		if (this.srcImage) {
			this.ctx.fillStyle = "black";

			this.ctx.save();
			this.ctx.scale(this.zoom, this.zoom);
			const width = this.srcImage.width * this.zoom;
			const height = this.srcImage.height * this.zoom;
			const [xPos, yPos] = this.centerIfSmaller(width, height);

			this.ctx.fillRect(xPos, yPos, this.srcImage.width, this.srcImage.height);
			this.ctx.drawImage(this.srcImage, xPos, yPos);
			this.ctx.restore();

			this.ctx.fillRect(this.canvas.width - 75, this.canvas.height - 15, 75, 15);
			this.ctx.textAlign = "right";
			this.ctx.fillStyle = "#fff";
			const lastMousePos = { x: this.lastMouseX / this.zoom, y: this.lastMouseY / this.zoom };
			const area = { x: xPos, y: yPos, width, height };
			const mousePos = clampPointInRect(lastMousePos, area);
			this.ctx.fillText(`(${Math.floor(mousePos.x)},${Math.floor(mousePos.y)}) x${this.zoom.toPrecision(2)}`, this.canvas.width - 4, this.canvas.height - 5);

			if (this.capturedArea) {
				this.ctx.strokeStyle = "#fff";
				this.ctx.strokeRect(this.capturedArea.x, this.capturedArea.y, this.capturedArea.width, this.capturedArea.height);
			}
		}
	}
}

/*
				.expandPanel {
					border: 1px solid white;
					background: rgb(51 51 51 / 85%);
					position:relative;
				}
				.expandToggle {
					position:absolute;
					right:0;
					background: black;
					padding:2px;
					display:grid;
					grid-auto-flow:column;
					gap:10px;
				}
				#script {
					background: transparent;
					color: white;
					width:100%;
					height:100%;
				}
				.expanded {
					position:fixed;
					left:10px;
					top:10px;
					right:10px;
					bottom:10px;				
				}

 */
