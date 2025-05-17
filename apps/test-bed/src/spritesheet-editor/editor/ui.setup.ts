export function setupUi(root: HTMLElement, onClick: (id: string) => void) {
	loadFonts(root);

	const commandButtons = root.querySelectorAll<HTMLButtonElement>("#move-cmd, #select-cmd");
	const actionButtons = root.querySelectorAll<HTMLButtonElement>("#open-image, #open-spritesheet, #new-spritesheet");
	const tabButtons = root.querySelectorAll<HTMLButtonElement>(".tab-btn");
	const tabPanes = root.querySelectorAll(".tab-pane");

	// Handle tab switching
	// biome-ignore lint/complexity/noForEach: <explanation>
	tabButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Remove active class from all tabs
			// biome-ignore lint/complexity/noForEach: <explanation>
			tabButtons.forEach((btn) => btn.classList.remove("active"));
			// biome-ignore lint/complexity/noForEach: <explanation>
			tabPanes.forEach((pane) => pane.classList.remove("active"));

			// Add active class to clicked tab and corresponding content
			button.classList.add("active");
			const tabId = button.getAttribute("data-tab");
			if (tabId) root.querySelector(`#${tabId}`)?.classList.add("active");
		});
	});

	// Handle command buttons (radio button behavior)
	// biome-ignore lint/complexity/noForEach: <explanation>
	commandButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Remove selected class from all command buttons
			// biome-ignore lint/complexity/noForEach: <explanation>
			commandButtons.forEach((btn) => btn.classList.remove("selected"));

			// Add selected class to clicked button
			button.classList.add("selected");

			onClick(button.id);
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

			onClick(button.id);
		});
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
