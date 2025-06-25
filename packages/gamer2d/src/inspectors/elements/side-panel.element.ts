export class SidePanel extends HTMLElement {
	static bootstrap() {
		if (!customElements.get("side-panel")) customElements.define("side-panel", SidePanel);
	}

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		shadow.appendChild(createTemplate());
		shadow.querySelector(".close-btn")?.addEventListener("click", () => this.hide());
		shadow.querySelector("SVG")?.addEventListener("click", () => {
			this.dispatchEvent(new CustomEvent("go-back", { bubbles: true, composed: true }));
		});
	}

	static get observedAttributes() {
		return ["side"];
	}

	get side(): "left" | "right" {
		return (this.getAttribute("side") as "left" | "right") || "right";
	}
	set side(val: "left" | "right") {
		this.setAttribute("side", val);
	}

	// attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	if (name === "side") {}
	// }

	show() {
		this.style.display = "block";
		requestAnimationFrame(() => {
			this.classList.add("open");
		});
	}

	hide() {
		this.classList.remove("open");
		const onTransitionEnd = () => {
			this.style.display = "none";
			this.removeEventListener("transitionend", onTransitionEnd);
			this.dispatchEvent(new CustomEvent("sidepanel-closed", { bubbles: true, composed: true }));
		};
		this.addEventListener("transitionend", onTransitionEnd);
	}

	clearContent() {
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.querySelectorAll(':not([slot="header"])').forEach((el) => el.remove());
	}

	old_setTitle(title: HTMLElement, _onBack?: () => void) {
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.querySelectorAll('[slot="header"]').forEach((el) => el.remove());
		title.slot = "header";
		this.appendChild(title);
		return this.querySelector('[slot="header"]');
	}
	setTitle(title: string | HTMLElement, wantIcon = true) {
		// Remove old header and icon slot elements
		// biome-ignore lint/complexity/noForEach: <explanation>
		Array.from(this.children).forEach((child) => {
			if ((child as HTMLElement).slot === "header") this.removeChild(child);
		});

		// Title slot
		let titleEl: HTMLElement;
		if (typeof title === "string") {
			titleEl = document.createElement("span");
			titleEl.textContent = title;
		} else titleEl = title;

		titleEl.slot = "header";
		this.appendChild(titleEl);

		const icon = this.shadowRoot?.querySelector("SVG") as HTMLImageElement;
		if (icon) icon.style.visibility = wantIcon ? "visible" : "hidden";
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
            <style>
                :host {
                    --panel-width: 300px;
                    --panel-bg-color: rgb(255 255 255 / 40%);
                    --panel-header-bg-color: rgb(16 122 245 / 40%);
                    --panel-header-color: white;
                    
                    display: none;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    width: var(--panel-width);
                    z-index: 999;
                    color: var(--panel-header-color);
                    background: var(--panel-bg-color);
                    backdrop-filter: blur(10px);
                    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                    transition: transform 0.25s cubic-bezier(.4,0,.2,1);
                    will-change: transform;
                }
                :host([side="right"]) {
                    right: 0;
                    left: auto;
                    transform: translateX(100%);
                }
                :host([side="left"]) {
                    left: 0;
                    right: auto;
                    transform: translateX(-100%);
                }
                :host(.open[side="right"]) {
                    transform: translateX(0);
                }
                :host(.open[side="left"]) {
                    transform: translateX(0);
                }                    
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: var(--panel-header-bg-color);
                    color: var(--panel-header-color);
                    gap:.5rem;
                }
                .header-icon {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                .header-title {
                    flex: 1 1 auto;
                    font-size: 1.1em;
                    font-weight: bold;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0 5px;
                    color: white;
                }
                .panel-content {
                    height: calc(100% - 44px);
                    overflow: auto;
                }
            </style>
            <div class="panel-header">
                <svg 
                    style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" 
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 199.404 199.404">
                <g>
                    <polygon
                        points="199.404,81.529 74.742,81.529 127.987,28.285 99.701,0 0,99.702 99.701,199.404 
                        127.987,171.119 74.742,117.876 199.404,117.876"/>
                </g>
                </svg>            
                <span class="header-title"><slot name="header"></slot></span>
                <button class="close-btn" title="Close">&times;</button>
            </div>
            <div class="panel-content">
                <slot></slot>
            </div>
        `;
	return template.content.cloneNode(true);
}
