import { generateID } from "../utils/id.util";

type Handler = (...args: unknown[]) => void;

export class TaskList {
	private id: string;
	private tasks: { name: symbol; args: unknown[] }[];
	private taskHandlers: Map<symbol, Handler>;

	constructor() {
		this.id = generateID();

		this.tasks = [];
		this.taskHandlers = new Map();
	}

	addTask(name: symbol, ...args: unknown[]) {
		this.tasks.push({ name, args });
	}

	onTask(name: symbol, handler) {
		this.taskHandlers.set(name, handler);
	}

	processTasks() {
		if (!this.tasks.length) return;
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.tasks.forEach(({ name, args }) => {
			const handler = this.taskHandlers.get(name);
			if (handler) handler(...args);
			else {
				console.log("----- TASK: no handler for", name.toString());
				console.log("taskHandlers", this.taskHandlers);
			}
		});
		this.tasks.length = 0;
	}
}
