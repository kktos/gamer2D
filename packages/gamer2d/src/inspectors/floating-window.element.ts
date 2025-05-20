export class FloatingWindowElement extends HTMLElement {
	private shadow: ShadowRoot;
	private titleBar: HTMLElement;
	private titleTextElement: HTMLElement;
	private closeButton: HTMLButtonElement;
	private minimizeButton: HTMLButtonElement;
	private windowContainer: HTMLElement;
	private contentArea: HTMLElement;

	private isDragging = false;
	private isResizing = false;
	private dragOffsetX = 0;
	private dragOffsetY = 0;

	private resizeDirection: string | null = null;
	private initialRect: { x: number; y: number; width: number; height: number } | null = null;
	private initialMousePos: { x: number; y: number } | null = null;

	static get observedAttributes() {
		return ["title", "closeable", "resizable", "minimizable", "minimized", "initial-width", "initial-height", "initial-top", "initial-left"];
	}

	static bootstrap() {
		if (!customElements.get("floating-window")) customElements.define("floating-window", FloatingWindowElement);
	}

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.appendChild(createTemplate());

		this.titleBar = this.shadow.querySelector(".title-bar") as HTMLElement;
		this.titleTextElement = this.shadow.querySelector(".title-bar-text") as HTMLElement;
		this.closeButton = this.shadow.querySelector(".close-button") as HTMLButtonElement;
		this.minimizeButton = this.shadow.querySelector(".minimize-button") as HTMLButtonElement;
		this.windowContainer = this.shadow.querySelector(".window-container") as HTMLElement;
		this.contentArea = this.shadow.querySelector(".content-area") as HTMLElement;

		this._initDrag();
		this._initResize();
		this._initControls();
		this.restoreState();
	}

	connectedCallback() {
		this._updateTitle();
		this._updateCloseButtonVisibility();
		this._updateResizable();
		this._updateMinimizeButtonVisibility();

		this.setInitialValues();
		// Ensure minimized state is correctly applied if set initially
		if (this.hasAttribute("minimized")) {
			this._updateMinimizedState(true);
		}
	}

	get closable(): boolean {
		return this.hasAttribute("closeable");
	}
	set closable(val: boolean) {
		if (val) this.setAttribute("closeable", "");
		else this.removeAttribute("closeable");
	}
	get resizable(): boolean {
		return this.hasAttribute("resizable");
	}
	set resizable(val: boolean) {
		if (val) this.setAttribute("resizable", "");
		else this.removeAttribute("resizable");
	}
	get minimizable(): boolean {
		return this.hasAttribute("minimizable");
	}
	set minimizable(val: boolean) {
		if (val) this.setAttribute("minimizable", "");
		else this.removeAttribute("minimizable");
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		switch (name) {
			case "title":
				this._updateTitle();
				break;
			case "closeable":
				this._updateCloseButtonVisibility();
				break;
			case "resizable":
				this._updateResizable();
				break;
			case "minimizable":
				this._updateMinimizeButtonVisibility();
				break;
			case "minimized":
				this._updateMinimizedState(newValue !== null);
				break;
			case "initial-width":
			case "initial-height":
			case "initial-top":
			case "initial-left":
				if (!this.isDragging && !this.isResizing) this.setInitialValues();
				break;
		}
	}

	private setInitialValues() {
		const width = this.getAttribute("initial-width");
		const height = this.getAttribute("initial-height");
		const top = this.getAttribute("initial-top");
		const left = this.getAttribute("initial-left");

		if (width) this.style.width = `${Number.parseInt(width, 10)}px`;
		if (height) this.style.height = `${Number.parseInt(height, 10)}px`;
		if (top) this.style.top = `${Number.parseInt(top, 10)}px`;
		if (left) this.style.left = `${Number.parseInt(left, 10)}px`;

		// Default position if not set
		if (!this.style.top && !this.style.left) {
			this.style.top = "50px";
			this.style.left = "50px";
		}
	}

	private _updateTitle() {
		this.titleTextElement.textContent = this.getAttribute("title") || "Window";
	}

	private _updateCloseButtonVisibility() {
		const isCloseable = this.hasAttribute("closeable");
		if (isCloseable) {
			this.closeButton.classList.remove("hidden");
		} else {
			this.closeButton.classList.add("hidden");
		}
	}

	private _updateMinimizeButtonVisibility() {
		const isMinimizable = this.hasAttribute("minimizable");
		if (isMinimizable) {
			this.minimizeButton.classList.remove("hidden");
		} else {
			this.minimizeButton.classList.add("hidden");
		}
	}

	private _updateResizable() {
		const show = this.hasAttribute("resizable");
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.shadow.querySelectorAll<HTMLElement>(".resize-handle").forEach((handle) => {
			handle.style.display = show ? "" : "none";
		});
	}

	private _updateMinimizedState(isMinimized: boolean) {
		if (isMinimized) {
			// Store current size and position before minimizing if not already stored
			if (!this.dataset.restoreWidth) {
				this.dataset.restoreWidth = this.style.width || `${this.offsetWidth}px`;
				this.dataset.restoreHeight = this.style.height || `${this.offsetHeight}px`;
				this.dataset.restoreTop = this.style.top;
				this.dataset.restoreLeft = this.style.left;
				this.style.right = "10px";
				this.style.left = "unset";
				this.style.bottom = "10px";
				this.style.top = "unset";
			}
		} else {
			// Restore size
			if (this.dataset.restoreWidth) this.style.width = this.dataset.restoreWidth;
			if (this.dataset.restoreHeight) this.style.height = this.dataset.restoreHeight;
			if (this.dataset.restoreTop) this.style.top = this.dataset.restoreTop;
			if (this.dataset.restoreLeft) this.style.left = this.dataset.restoreLeft;
			// Clear stored values
			delete this.dataset.restoreWidth;
			delete this.dataset.restoreHeight;
			delete this.dataset.restoreTop;
			delete this.dataset.restoreLeft;
		}
	}

	private _initDrag() {
		this.titleBar.addEventListener("mousedown", (e: MouseEvent) => {
			if (e.target !== this.titleBar && e.target !== this.titleTextElement) return;
			if (this.hasAttribute("minimized")) return;

			this.isDragging = true;
			const rect = this.getBoundingClientRect();
			this.dragOffsetX = e.clientX - rect.left;
			this.dragOffsetY = e.clientY - rect.top;

			// Bring to front (simple version, might need more robust z-index management for many windows)
			const allWindows = document.querySelectorAll("floating-window");
			let maxZ = 0;
			// biome-ignore lint/complexity/noForEach: <explanation>
			allWindows.forEach((win) => {
				const z = Number.parseInt(window.getComputedStyle(win).zIndex, 10);
				if (!Number.isNaN(z) && z > maxZ) maxZ = z;
			});
			this.style.zIndex = (maxZ + 1).toString();

			document.addEventListener("mousemove", this._onDrag);
			document.addEventListener("mouseup", this._onDragEnd);
		});
	}

	private _onDrag = (e: MouseEvent) => {
		if (!this.isDragging) return;
		e.preventDefault();
		this.style.left = `${e.clientX - this.dragOffsetX}px`;
		this.style.top = `${e.clientY - this.dragOffsetY}px`;
		this.dispatchEvent(new CustomEvent("moved", { detail: { x: this.style.left, y: this.style.top } }));
	};

	private _onDragEnd = () => {
		this.isDragging = false;
		document.removeEventListener("mousemove", this._onDrag);
		document.removeEventListener("mouseup", this._onDragEnd);
		this.saveState();
	};

	private _initResize() {
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.shadow.querySelectorAll(".resize-handle").forEach((handle) => {
			(handle as HTMLElement).addEventListener("mousedown", (e: MouseEvent) => {
				if (this.hasAttribute("minimized")) return; // No resizing when minimized

				e.stopPropagation(); // Prevent title bar drag
				this.isResizing = true;
				this.resizeDirection = (e.target as HTMLElement).dataset.direction || null;

				const rect = this.getBoundingClientRect();
				this.initialRect = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
				this.initialMousePos = { x: e.clientX, y: e.clientY };

				document.addEventListener("mousemove", this._onResize);
				document.addEventListener("mouseup", this._onResizeEnd);
			});
		});
	}

	private _onResize = (e: MouseEvent) => {
		if (!this.isResizing || !this.initialRect || !this.initialMousePos || !this.resizeDirection) return;
		e.preventDefault();

		const dx = e.clientX - this.initialMousePos.x;
		const dy = e.clientY - this.initialMousePos.y;

		let newWidth = this.initialRect.width;
		let newHeight = this.initialRect.height;
		let newLeft = this.initialRect.x;
		let newTop = this.initialRect.y;

		if (this.resizeDirection.includes("e")) newWidth = this.initialRect.width + dx;
		if (this.resizeDirection.includes("w")) {
			newWidth = this.initialRect.width - dx;
			newLeft = this.initialRect.x + dx;
		}
		if (this.resizeDirection.includes("s")) newHeight = this.initialRect.height + dy;
		if (this.resizeDirection.includes("n")) {
			newHeight = this.initialRect.height - dy;
			newTop = this.initialRect.y + dy;
		}

		// Enforce min dimensions (from CSS or hardcoded)
		const minWidth = Number.parseInt(getComputedStyle(this).minWidth, 10) || 150;
		const minHeight = Number.parseInt(getComputedStyle(this).minHeight, 10) || 100;

		if (newWidth >= minWidth) {
			this.style.width = `${newWidth}px`;
			if (this.resizeDirection.includes("w")) this.style.left = `${newLeft}px`;
		}
		if (newHeight >= minHeight) {
			this.style.height = `${newHeight}px`;
			if (this.resizeDirection.includes("n")) this.style.top = `${newTop}px`;
		}
		this.dispatchEvent(new CustomEvent("resized", { detail: { width: this.style.width, height: this.style.height } }));
	};

	private _onResizeEnd = () => {
		this.isResizing = false;
		this.resizeDirection = null;
		this.initialRect = null;
		this.initialMousePos = null;
		document.removeEventListener("mousemove", this._onResize);
		document.removeEventListener("mouseup", this._onResizeEnd);
	};

	private _initControls() {
		this.closeButton.addEventListener("click", () => {
			if (this.hasAttribute("closeable")) {
				this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
				this.remove(); // Or hide: this.style.display = 'none';
			}
		});

		this.minimizeButton.addEventListener("click", () => {
			const isMinimized = this.hasAttribute("minimized");
			if (isMinimized) {
				this.removeAttribute("minimized");
				this.dispatchEvent(new CustomEvent("restored"));
			} else {
				this.setAttribute("minimized", "");
				this.dispatchEvent(new CustomEvent("minimized"));
			}
		});
	}

	public saveState() {
		if (this.id) {
			const state = {
				width: this.style.width,
				height: this.style.height,
				left: this.style.left,
				top: this.style.top,
			};
			localStorage.setItem(this.id, JSON.stringify(state));
		}
	}
	public restoreState() {
		if (this.id) {
			const state = localStorage.getItem(this.id);
			if (state) {
				const { left, top, width, height } = JSON.parse(state);
				this.style.left = left;
				this.style.top = top;
				this.style.width = width;
				this.style.height = `${height}px`;
			}
		}
	}

	/**
	 * Sets the content of the floating window.
	 * This will replace any existing content within the window's content area, including the <slot>.
	 * @param content An HTML string, an HTMLElement, or a DocumentFragment to set as content.
	 */
	public setContent(content: string | Node): void {
		this.contentArea.innerHTML = "";
		if (typeof content === "string") this.contentArea.innerHTML = content;
		else if (content instanceof Node) this.contentArea.appendChild(content);
	}

	/**
	 * Gets the main content container element of the window.
	 * This is the element where content set by `setContent` is placed.
	 * @returns The HTMLElement representing the content area.
	 */
	public getContentElement(): HTMLElement {
		return this.contentArea;
	}

	public open() {
		this.style.display = "block";
	}

	public close() {
		this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
		this.remove();
	}

	public minimize() {
		if (!this.hasAttribute("minimized")) {
			this.setAttribute("minimized", "");
			this.dispatchEvent(new CustomEvent("minimized"));
		}
	}

	public restore() {
		if (this.hasAttribute("minimized")) {
			this.removeAttribute("minimized");
			this.dispatchEvent(new CustomEvent("restored"));
		}
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
  <style>
    :host {

	  --window-bg-color: #333;
	  --window-color: #eee;
	  --window-z-index: 1000;
	  --window-title-bg-color: #444;
	  --window-content-padding: 10px;
	  --window-min-width: 80px;

      background-color: var(--window-bg-color);
      z-index: var(--window-z-index);
      color: var(--window-color);

      display: block;
      position: fixed;
      min-width: var(--window-min-width);
      min-height: 100px; /* Includes title bar */
      border: 1px solid #555;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      border-radius: 4px;
      overflow: hidden;
      font-family: sans-serif;
      user-select: none;
    }

    .window-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px;
      height: 30px;
      background-color: var(--window-title-bg-color);
      border-bottom: 1px solid #555;
      cursor: move;
      flex-shrink: 0; /* Prevent title bar from shrinking */
    }

    .title-bar-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-grow: 1;
    }

    .window-controls {
      display: flex;
      gap: 5px;
    }

    .window-controls button {
      background: none;
      border: none;
      color: #ccc;
      font-size: 14px;
      font-weight: bold;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      cursor: pointer;
      border-radius: 3px;
    }
    .window-controls button:hover {
      background-color: #555;
      color: #fff;
    }

    .close-button.hidden {
      display: none;
    }
    .minimize-button.hidden {
      display: none;
    }

    .content-area {
      flex-grow: 1;
      padding: var(--window-content-padding);
      overflow: auto;
      background-color: transparent;
	  position:relative;
    }

    /* Minimized state */
    :host([minimized]) {
	  width: min-content !important;
      height: min-content !important;
      min-width: 0px;
      min-height: 0px;
      overflow: hidden;
    }
    // :host([minimized]) .title-bar-text {
    //   display: none; /* Hide title text when minimized */
    // }
    :host([minimized]) .content-area {
      display: none;
    }
    :host([minimized]) .resize-handle {
      display: none; /* Hide resize handles when minimized */
    }
    :host([minimized]) .minimize-button::after {
      content: "❐"; /* Restore icon */
    }
    :host(:not([minimized])) .minimize-button::after {
      content: "–"; /* Minimize icon */
    }


    /* Resize Handles */
    .resize-handle {
      position: absolute;
      background: transparent; /* For interaction, not visibility */
    }
    .resize-n { top: -3px; left: 6px; right: 6px; height: 6px; cursor: n-resize; }
    .resize-s { bottom: -3px; left: 6px; right: 6px; height: 6px; cursor: s-resize; }
    .resize-e { right: -3px; top: 6px; bottom: 6px; width: 6px; cursor: e-resize; }
    .resize-w { left: -3px; top: 6px; bottom: 6px; width: 6px; cursor: w-resize; }
    .resize-nw { top: -3px; left: -3px; width: 6px; height: 6px; cursor: nw-resize; }
    .resize-ne { top: -3px; right: -3px; width: 6px; height: 6px; cursor: ne-resize; }
    .resize-sw { bottom: -3px; left: -3px; width: 6px; height: 6px; cursor: sw-resize; }
    .resize-se { bottom: -3px; right: -3px; width: 6px; height: 6px; cursor: se-resize; }

  </style>
  <div class="window-container">
    <div class="title-bar" part="title-bar">
      <span class="title-bar-text" part="title-text"></span>
      <div class="window-controls" part="controls">
        <button class="minimize-button" part="minimize-button" aria-label="Minimize/Restore"></button>
        <button class="close-button" part="close-button" aria-label="Close">×</button>
      </div>
    </div>
    <div class="content-area" part="content">
      <slot></slot>
    </div>
    <div class="resize-handle resize-n" data-direction="n"></div>
    <div class="resize-handle resize-s" data-direction="s"></div>
    <div class="resize-handle resize-e" data-direction="e"></div>
    <div class="resize-handle resize-w" data-direction="w"></div>
    <div class="resize-handle resize-nw" data-direction="nw"></div>
    <div class="resize-handle resize-ne" data-direction="ne"></div>
    <div class="resize-handle resize-sw" data-direction="sw"></div>
    <div class="resize-handle resize-se" data-direction="se"></div>
  </div>
`;
	return template.content.cloneNode(true);
}
