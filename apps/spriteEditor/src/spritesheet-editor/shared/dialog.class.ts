interface ModernDialogOptions {
	title?: string;
	content: string | HTMLElement;
	buttons?: { text: string; onClick: (dialog: ModernDialog) => void; className?: string }[];
	onClose?: (dialog: ModernDialog) => void;
	modalId?: string; // Optional ID for the dialog element
}

export class ModernDialog {
	private dialogElement: HTMLElement | null = null;
	private overlayElement: HTMLElement | null = null;
	private options: ModernDialogOptions;
	private boundHandleEscKey: (event: KeyboardEvent) => void;

	constructor(options: ModernDialogOptions) {
		this.options = options;
		this.boundHandleEscKey = this._handleEscKey.bind(this);
		this._createDialog();
	}

	private _createDialog(): void {
		// Create overlay
		this.overlayElement = document.createElement("div");
		this.overlayElement.className = "modern-dialog-overlay";
		this.overlayElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1010;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    `;

		// Create dialog container
		this.dialogElement = document.createElement("div");
		this.dialogElement.className = "modern-dialog";
		if (this.options.modalId) this.dialogElement.id = this.options.modalId;

		this.dialogElement.setAttribute("role", "dialog");
		this.dialogElement.setAttribute("aria-modal", "true");
		this.dialogElement.setAttribute("aria-labelledby", this.options.modalId ? `${this.options.modalId}-title` : "dialog-title");

		this.dialogElement.style.cssText = `
      background-color: rgba(0 0 0 / 42%);
      color: #f0f0f0;
	  border:1px solid;
	  backdrop-filter:blur(10px);
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      min-width: 320px;
      max-width: 600px;
      width: 90%;
      transform: scale(0.95);
      transition: transform 0.2s ease-in-out;
    `;

		let header: HTMLDivElement | undefined;
		if (this.options.title) {
			// Dialog header
			header = document.createElement("div");
			header.className = "modern-dialog-header";
			header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #444;
    `;

			const titleElement = document.createElement("h2");
			titleElement.id = this.options.modalId ? `${this.options.modalId}-title` : "dialog-title";
			titleElement.className = "modern-dialog-title";
			titleElement.textContent = this.options.title;
			titleElement.style.cssText = `
      margin: 0;
      font-size: 1.3em;
      font-weight: 500;
    `;

			const closeButton = document.createElement("button");
			closeButton.className = "modern-dialog-close";
			closeButton.innerHTML = "&times;";
			closeButton.setAttribute("aria-label", "Close dialog");
			closeButton.style.cssText = `
      background: transparent;
      border: none;
      color: #aaa;
      font-size: 1.8em;
      line-height: 1;
      cursor: pointer;
      padding: 0 5px;
      transition: color 0.2s;
    `;
			closeButton.onmouseover = () => {
				closeButton.style.color = "#fff";
			};
			closeButton.onmouseout = () => {
				closeButton.style.color = "#aaa";
			};
			closeButton.onclick = () => {
				this.hide();
				if (this.options.onClose) this.options.onClose(this);
			};

			header.appendChild(titleElement);
			header.appendChild(closeButton);
		}

		// Dialog content
		const contentElement = document.createElement("div");
		contentElement.className = "modern-dialog-content";
		if (typeof this.options.content === "string") {
			contentElement.innerHTML = this.options.content;
		} else {
			contentElement.appendChild(this.options.content);
		}
		contentElement.style.marginBottom = "25px";
		contentElement.style.lineHeight = "1.6";

		// Dialog footer (buttons)
		const footer = document.createElement("div");
		footer.className = "modern-dialog-footer";
		footer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    `;

		if (this.options.buttons && this.options.buttons.length > 0) {
			for (const buttonConfig of this.options.buttons) {
				const button = document.createElement("button");
				button.textContent = buttonConfig.text;
				button.className = `modern-dialog-button ${buttonConfig.className || ""}`;
				button.onclick = () => buttonConfig.onClick(this);
				button.style.cssText = `
          padding: 10px 18px;
          border: 1px solid #555;
          border-radius: 5px;
          cursor: pointer;
          background-color: #3a3a3a;
          color: #f0f0f0;
          font-size: 0.95em; 
          transition: background-color 0.2s, border-color 0.2s;
        `;
				if (buttonConfig.className === "primary") {
					button.style.backgroundColor = "#007bff";
					button.style.borderColor = "#007bff";
					button.style.color = "white";
				}
				button.onmouseover = () => {
					if (buttonConfig.className !== "primary") button.style.backgroundColor = "#4a4a4a";
				};
				button.onmouseout = () => {
					if (buttonConfig.className !== "primary") button.style.backgroundColor = "#3a3a3a";
				};
				footer.appendChild(button);
			}
		}

		if (header) this.dialogElement.appendChild(header);
		this.dialogElement.appendChild(contentElement);
		this.dialogElement.appendChild(footer);

		this.overlayElement.appendChild(this.dialogElement);
		document.body.appendChild(this.overlayElement);
	}

	private _handleEscKey(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			this.hide();
			if (this.options.onClose) this.options.onClose(this);
		}
	}

	public show(): void {
		if (this.overlayElement && this.dialogElement) {
			this.overlayElement.style.visibility = "visible";
			this.overlayElement.style.opacity = "1";
			this.dialogElement.style.transform = "scale(1)";
			document.addEventListener("keydown", this.boundHandleEscKey);
			this.dialogElement.focus(); // For accessibility
		}
	}

	public hide(): void {
		if (this.overlayElement && this.dialogElement) {
			this.overlayElement.style.opacity = "0";
			this.dialogElement.style.transform = "scale(0.95)";
			setTimeout(() => {
				if (this.overlayElement) this.overlayElement.style.visibility = "hidden";
			}, 200); // Match transition duration
			document.removeEventListener("keydown", this.boundHandleEscKey);
		}
	}

	public destroy(): void {
		if (this.overlayElement) {
			document.removeEventListener("keydown", this.boundHandleEscKey);
			this.overlayElement.remove();
			this.overlayElement = null;
			this.dialogElement = null;
		}
	}
}

export async function confirmDialog(text: string, ok: string, cancel: string, title?: string) {
	const myContent = document.createElement("p");
	myContent.textContent = text;

	return new Promise((resolve) => {
		const dialog = new ModernDialog({
			title: title,
			content: myContent,
			modalId: "my-custom-dialog",
			buttons: [
				{
					text: ok,
					className: "primary",
					onClick: (dlg) => {
						resolve(true);
						dlg.destroy();
					},
				},
				{
					text: cancel,
					onClick: (dlg) => {
						resolve(false);
						dlg.destroy();
					},
				},
			],
			onClose: (dlg) => {
				resolve(false);
				dlg.destroy();
			},
		});

		dialog.show();
	});
}
