export function setupUi(root: HTMLElement, onClick: (id: string) => void) {
	loadFonts(root);

	const commandButtons = root.querySelectorAll<HTMLButtonElement>("#move-cmd, #select-cmd");
	const actionButtons = root.querySelectorAll<HTMLButtonElement>("#open-image, #open-spritesheet, #new-spritesheet");
	const activeCommandDisplay = root.querySelector("#active-command");
	const commandIcon = root.querySelector("#command-icon");
	const commandDescription = root.querySelector("#command-description");
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

	// Command descriptions
	const commandDescriptions = {
		Move: "Click and drag to move objects in the workspace.",
		Select: "Click to select objects for editing or manipulation.",
	};

	const commandIcons = {
		Move: "fas fa-arrows-alt",
		Select: "fas fa-mouse-pointer",
	};

	// Handle command buttons (radio button behavior)
	// biome-ignore lint/complexity/noForEach: <explanation>
	commandButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Remove selected class from all command buttons
			// biome-ignore lint/complexity/noForEach: <explanation>
			commandButtons.forEach((btn) => btn.classList.remove("selected"));

			// Add selected class to clicked button
			button.classList.add("selected");

			// Update active command display
			const commandText = button.querySelector("span")?.textContent;
			if (activeCommandDisplay && commandText) activeCommandDisplay.textContent = commandText;

			// Update command icon and description
			if (commandIcon && commandDescription && commandText) {
				commandIcon.className = commandIcons[commandText];
				commandDescription.textContent = commandDescriptions[commandText];
			}

			onClick(button.id);
		});
	});

	// Action icons
	const actionIcons = {
		"Open Image": "far fa-image",
		"Open Spritesheet": "fas fa-th",
		"New Spritesheet": "fas fa-plus",
		None: "fas fa-info-circle",
	};

	// Handle action buttons
	// biome-ignore lint/complexity/noForEach: <explanation>
	actionButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const actionText = button.querySelector("span")?.textContent;

			// Add a visual feedback for button click
			const originalBg = button.style.backgroundColor;
			button.style.backgroundColor = "#22c55e";

			setTimeout(() => {
				button.style.backgroundColor = originalBg;
			}, 200);

			onClick(button.id);

			/*
                    lastActionDisplay.textContent = actionText;
                    
                    // Update action icon and details
                    actionIcon.className = actionIcons[actionText];
                    actionDetails.textContent = `Action "${actionText}" was performed successfully.`;
                    
                    // Update timestamp
                    const now = new Date();
                    const timeString = now.toLocaleTimeString();
                    actionTime.textContent = timeString;
                    
                    
                    // Switch to the action tab
                    tabButtons[1].click();
                    
                    console.log(`Action performed: ${actionText}`);
                    
                    // Here you would add the actual functionality for each action
                    switch(this.id) {
                        case 'open-image':
                            // Code to open image
                            break;
                        case 'open-spritesheet':
                            // Code to open spritesheet
                            break;
                        case 'new-spritesheet':
                            // Code to create new spritesheet
                            break;
                    }
							*/
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
