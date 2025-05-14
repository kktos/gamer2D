const allowedFileTypes = ["image/png", "image/jpeg", "image/gif"];
export async function loadImage(name: string): Promise<HTMLImageElement> {
	console.log(`loadImage path(${name})`);

	const query = await fetch(name);
	const imgBlob = await query.blob();

	// if (!allowedFileTypes.includes(imgBlob.type)) throw new TypeError(`Unknown image type ${imgBlob.type}`);
	if (!allowedFileTypes.includes(imgBlob.type)) return Promise.reject(`ERROR on ${name}: Unknown image type ${imgBlob.type}`);

	return await new Promise((resolve) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.src = URL.createObjectURL(imgBlob);
	});
}

export async function loadSound(name: string) {
	console.log(`loadSound(${name})`);
	const query = await fetch(name);
	return await query.arrayBuffer();
}

export async function loadJson(url: string) {
	console.log(`loadJson(${url})`);
	const query = await fetch(url);
	return await query.json();
}

export async function loadText(url: string) {
	console.log(`loadText(${url})`);
	const query = await fetch(url);
	return await query.text();
}

export function saveFileAs(filename: string, data: unknown) {
	const blob = new Blob([JSON.stringify(data, null, 2)]);
	const link = document.createElement("a");
	link.download = filename;
	link.href = window.URL.createObjectURL(blob);
	link.click();
}
