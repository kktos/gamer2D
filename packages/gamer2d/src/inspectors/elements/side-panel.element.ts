export class SidePanel extends HTMLElement {
	static bootstrap() {
		if (!customElements.get("side-panel")) customElements.define("side-panel", SidePanel);
	}

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		shadow.appendChild(createTemplate());
		shadow.querySelector(".close-btn")?.addEventListener("click", () => this.hide());
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
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
            <style>
                :host {
                    --panel-width: 300px;
                    --panel-bg-color: rgb(255 255 255 / 50%);
                    --panel-header-bg-color: rgb(16 122 245 / 70%);
                    --panel-header-color: white;
                    
                    display: none;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    width: var(--panel-width);
                    z-index: 999;
                    background: var(--panel-bg-color);
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
                }
                .header-content {
                    flex: 1 1 auto;
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
                <span class="header-content"><slot name="header"></slot></span>
                <button class="close-btn" title="Close">&times;</button>
            </div>
            <div class="panel-content">
                <slot></slot>
            </div>
        `;
	return template.content.cloneNode(true);
}
