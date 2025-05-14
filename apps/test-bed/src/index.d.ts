export {};

declare global {
	interface Window {
		showOpenFilePicker(options): Promise<FileSystemFileHandle[]>;
	}
}

declare module "*.module.css?raw" {
	const content: string;
	export default content;
}

declare module "*.css?raw" {
	const content: string;
	export default content;
}
