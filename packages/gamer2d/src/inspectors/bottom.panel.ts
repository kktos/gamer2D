const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgb(0 0 0 / 80%);
            color: #abb2bf;
            border-top: 1px solid #3e4451;
            box-shadow: 0 -3px 15px rgba(0,0,0,0.3);
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            user-select: none; /* Prevent text selection during resize */
        }

        .resize-handle {
            height: 4px;
            background-color: rgb(0 0 0 / 80%);
            cursor: ns-resize;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .resize-handle:hover {
            background-color: rgb(255 255 255 / 80%);
        }
        .resize-handle-indicator {
            width: 50px;
            height: 2px;
            background-color: #fff;
            border-radius: 2px;
        }
        .resize-handle-indicator:hover {
            background-color: black;
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: rgb(58 92 142 / 69%);
            flex-shrink: 0;
        }

        .panel-title {
            font-weight: bold;
        }

        .close-button {
            background: none;
            border: none;
            color: #abb2bf;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
            padding: 0 5px;
        }

        .panel-content {
            flex-grow: 1;
            overflow-y: auto;
            padding: 15px;
            box-sizing: border-box;
        }

		.hvcenter {
			align-self: center;
			justify-self: center;
		}
		.vcenter {
			align-self: center;
			align-items: center;
		}
		.grid-column {
			display: grid;
			grid-auto-flow: column;
		}
.btn {
	cursor: pointer;
	display: grid;
	grid-auto-flow: column;
	align-items: center;
}
.btn:hover {
	background-color: rgba(0, 0, 0, 50%);
}
.light-shadow {
	filter: drop-shadow(2px 4px 2px #666666);
}
DIV.btn.icn {
	padding: 0;
	min-width: auto;
}

.icn-left-arrow {
	background: url(/assets/images/left-arrow.png);
	width: 50px;
	aspect-ratio: 1;
}
.icn-up-arrow {
	background: url(/assets/images/left-arrow.png);
	width: 50px;
	aspect-ratio: 1;
	rotate: 90deg;
}
.icn-down-arrow {
	background: url(/assets/images/left-arrow.png);
	width: 50px;
	aspect-ratio: 1;
	rotate: -90deg;
}
.icn-trash {
	background: url(/assets/images/trash.png);
	width: 50px;
	aspect-ratio: 1;
}
.icn-load {
	background: url(/assets/images/load.png);
	width: 50px;
	aspect-ratio: 1;
}
.icn-save {
	background: url(/assets/images/save.png);
	width: 50px;
	aspect-ratio: 1;
}
.icn-down-play {
	background: url(/assets/images/play.svg);
	width: 50px;
	aspect-ratio: 1;
}
.icn-close {
	background: url(/assets/images/close.svg);
	aspect-ratio: 1;
}
.z50 {
	zoom: 0.5;
}


    </style>
    <div class="resize-handle" part="resize-handle" style="display: none;">
        <div class="resize-handle-indicator" part="resize-handle-indicator"></div>
    </div>
    <div class="panel-header" part="header">
        <span class="panel-title" part="title">Panel</span>
        <button class="close-button" part="close-button" style="display: none;" aria-label="Close panel">&times;</button>
    </div>
    <div class="panel-content" part="content"></div>
`;

type TProps = "panelTitle" | "initialHeight" | "minHeight" | "maxHeight" | "closable" | "resizable" | "opened" | "panelZIndex";

export class ResizablePanel extends HTMLElement {
	private _shadowRoot: ShadowRoot;
	private _contentElement!: HTMLElement;
	private _titleElement!: HTMLElement;
	private _resizeHandleElement!: HTMLElement;
	private _closeButtonElement!: HTMLElement;

	private isResizing = false;
	private lastMouseY = 0;
	private currentHeight = 0;

	static bootstrap() {
		if (!customElements.get("resizable-panel")) customElements.define("resizable-panel", ResizablePanel);
	}

	static get observedAttributes() {
		return ["panel-title", "initial-height", "min-height", "max-height", "closable", "resizable", "opened", "panel-z-index"];
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({ mode: "open" });
		this._shadowRoot.appendChild(template.content.cloneNode(true));

		this._titleElement = this._shadowRoot.querySelector(".panel-title") as HTMLElement;
		this._contentElement = this._shadowRoot.querySelector(".panel-content") as HTMLElement;
		this._resizeHandleElement = this._shadowRoot.querySelector(".resize-handle") as HTMLElement;
		this._closeButtonElement = this._shadowRoot.querySelector(".close-button") as HTMLElement;
	}

	connectedCallback() {
		this._upgradeProperty("panelTitle");
		this._upgradeProperty("initialHeight");
		this._upgradeProperty("minHeight");
		this._upgradeProperty("maxHeight");
		this._upgradeProperty("closable");
		this._upgradeProperty("resizable");
		this._upgradeProperty("opened");
		this._upgradeProperty("panelZIndex");

		this.style.zIndex = String(this.panelZIndex);
		this.currentHeight = this.initialHeight;
		this.setHeight(this.currentHeight);

		if (this.opened) this.open();
		else if (this.hasAttribute("opened") && this.getAttribute("opened") !== "false") this.open();
		else this.close(true);

		this._updateClosable();
		this._updateResizable();
		this._updateTitle();

		this._bindEvents();
	}

	disconnectedCallback() {
		document.removeEventListener("mousemove", this.onResizing);
		document.removeEventListener("mouseup", this.onResizeEnd);
		if (this.resizable) this._resizeHandleElement.removeEventListener("mousedown", this._onResizeStart);
		if (this.closable) this._closeButtonElement.removeEventListener("click", this._onCloseClick);
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (oldValue === newValue) return;
		switch (name) {
			case "panel-title":
				this._updateTitle();
				break;
			case "initial-height":
			case "min-height":
			case "max-height":
				this.setHeight(this.currentHeight); // Re-apply height to respect new min/max
				break;
			case "closable":
				this._updateClosable();
				break;
			case "resizable":
				this._updateResizable();
				break;
			case "opened":
				if (this.hasAttribute("opened") && this.getAttribute("opened") !== "false") this.open();
				else this.close();

				break;
			case "panel-z-index":
				this.style.zIndex = String(this.panelZIndex);
				break;
		}
	}

	// Props with getters/setters to sync attributes
	get panelTitle(): string {
		return this.getAttribute("panel-title") || "Panel";
	}
	set panelTitle(value: string) {
		this.setAttribute("panel-title", value);
	}

	get initialHeight(): number {
		return Number.parseInt(this.getAttribute("initial-height") || "150", 10);
	}
	set initialHeight(value: number) {
		this.setAttribute("initial-height", String(value));
	}

	get minHeight(): number {
		return Number.parseInt(this.getAttribute("min-height") || "50", 10);
	}
	set minHeight(value: number) {
		this.setAttribute("min-height", String(value));
	}

	get maxHeight(): number {
		const attr = this.getAttribute("max-height");
		return attr ? Number.parseInt(attr, 10) : typeof window !== "undefined" ? window.innerHeight / 2 : 300;
	}
	set maxHeight(value: number) {
		this.setAttribute("max-height", String(value));
	}

	get closable(): boolean {
		return this.hasAttribute("closable") && this.getAttribute("closable") !== "false";
	}
	set closable(value: boolean) {
		value ? this.setAttribute("closable", "") : this.removeAttribute("closable");
	}

	get resizable(): boolean {
		return this.hasAttribute("resizable") && this.getAttribute("resizable") !== "false";
	}
	set resizable(value: boolean) {
		value ? this.setAttribute("resizable", "") : this.removeAttribute("resizable");
	}

	get opened(): boolean {
		return this.hasAttribute("opened") && this.getAttribute("opened") !== "false";
	}
	set opened(value: boolean) {
		value ? this.setAttribute("opened", "") : this.removeAttribute("opened");
	}

	get panelZIndex(): number {
		return Number.parseInt(this.getAttribute("panel-z-index") || "1000", 10);
	}
	set panelZIndex(value: number) {
		this.setAttribute("panel-z-index", String(value));
	}

	// private _upgradeProperty(prop: keyof ResizablePanel) {
	private _upgradeProperty(prop: TProps) {
		if (Object.hasOwn(this, prop)) {
			const value = this[prop];
			delete this[prop];
			(this as Record<string, unknown>)[prop] = value;
		}
	}

	private _updateTitle() {
		this._titleElement.textContent = this.panelTitle;
	}

	private _updateClosable() {
		this._closeButtonElement.style.display = this.closable ? "" : "none";
	}

	private _updateResizable() {
		this._resizeHandleElement.style.display = this.resizable ? "" : "none";
	}

	private _bindEvents(): void {
		if (this.resizable) this._resizeHandleElement.addEventListener("mousedown", this._onResizeStart.bind(this));
		if (this.closable) this._closeButtonElement.addEventListener("click", this._onCloseClick.bind(this));
	}

	private _onResizeStart(event: MouseEvent): void {
		if (!this.resizable) return;
		event.preventDefault();
		this.isResizing = true;
		this.lastMouseY = event.clientY;
		this.currentHeight = this.offsetHeight;
		document.body.style.cursor = "ns-resize";

		document.addEventListener("mousemove", this.onResizing.bind(this));
		document.addEventListener("mouseup", this.onResizeEnd.bind(this));
	}

	private onResizing(event: MouseEvent): void {
		if (!this.isResizing || !this.resizable) return;
		const deltaY = event.clientY - this.lastMouseY;
		this.lastMouseY = event.clientY;
		const newHeight = this.currentHeight - deltaY;

		this.setHeight(newHeight);
		this.currentHeight = this.offsetHeight; // Update currentHeight after clamping
		this.dispatchEvent(new CustomEvent("panel-resize", { detail: { height: this.currentHeight } }));
	}

	private onResizeEnd(): void {
		if (!this.isResizing) return;
		this.isResizing = false;
		document.body.style.cursor = "";

		document.removeEventListener("mousemove", this.onResizing);
		document.removeEventListener("mouseup", this.onResizeEnd);
		this.dispatchEvent(new CustomEvent("panel-resize-end", { detail: { height: this.currentHeight } }));
	}

	private _onCloseClick(): void {
		this.close();
	}

	public setContent(htmlOrElement: string | HTMLElement): void {
		if (typeof htmlOrElement === "string") {
			this._contentElement.innerHTML = htmlOrElement;
		} else {
			this._contentElement.innerHTML = ""; // Clear existing content
			this._contentElement.appendChild(htmlOrElement);
		}
	}

	public getContentElement(): HTMLElement {
		return this._contentElement;
	}

	public open(silent = false): void {
		this.style.display = "flex";
		this.opened = true;
		if (!silent) this.dispatchEvent(new CustomEvent("panel-opened"));
	}

	public close(silent = false): void {
		this.style.display = "none";
		this.opened = false;
		if (!silent) this.dispatchEvent(new CustomEvent("panel-closed"));
	}

	public toggle(): void {
		if (this.opened) this.close();
		else this.open();
	}

	public setHeight(height: number): void {
		const newHeight = Math.max(this.minHeight, Math.min(height, this.maxHeight));
		this.style.height = `${newHeight}px`;
		this.currentHeight = newHeight; // Keep internal track
	}

	public getHeight(): number {
		return this.offsetHeight;
	}
}
