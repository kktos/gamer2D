import type { TCommandEvent } from "../shared/types.js";

export function setupUi(root: HTMLElement, onClick: (id: string, data?: unknown) => void) {
	loadFonts(root);

	const commandButtons = root.querySelectorAll<HTMLButtonElement>("#move-cmd, #select-cmd");
	const actionButtons = root.querySelectorAll<HTMLButtonElement>("#open-image, #open-spritesheet, #new-spritesheet");

	// Handle command buttons (radio button behavior)
	// biome-ignore lint/complexity/noForEach: <explanation>
	commandButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Remove selected class from all command buttons
			// biome-ignore lint/complexity/noForEach: <explanation>
			commandButtons.forEach((btn) => btn.classList.remove("selected"));

			// Add selected class to clicked button
			button.classList.add("selected");

			onClick(button.id, "command");
		});
	});

	// Handle action buttons
	// biome-ignore lint/complexity/noForEach: <explanation>
	actionButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Add a visual feedback for button click
			const originalBg = button.style.backgroundColor;
			button.style.backgroundColor = "#22c55e";

			setTimeout(() => {
				button.style.backgroundColor = originalBg;
			}, 200);

			onClick(button.id, "action");
		});
	});

	root.addEventListener("command", (e) => {
		const command = (e as TCommandEvent).detail;
		onClick(command.id, command.data);
	});
}

export async function loadFonts(root: HTMLElement) {
	// const fontName = "FontAwesome";
	// Check if font is already loaded
	// if (document.fonts.check(`1em ${fontName}`)) {
	// 	console.log(`${fontName} is already available`);
	// 	return;
	// }
	// console.log(`${fontName} not found, loading it now...`);
	// // Load the font if not available
	// const fontUrl = "https://use.fontawesome.com/releases/v6.4.0/webfonts/fa-regular-400.woff2";
	// const fontAwesome = new FontFace(fontName, `url(${fontUrl})`, {
	// 	style: "normal",
	// 	weight: "400",
	// });
	// const loadedFont = await fontAwesome.load();
	// document.fonts.add(loadedFont);
	// console.log(`${fontName} successfully loaded`);

	//<link href="main.css" rel="stylesheet" />
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";
	document.head.append(link);
}
