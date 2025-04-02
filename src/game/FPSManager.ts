export class FPSManager {
	private isRunning: boolean;
	private lastTime: number;
	private accumulatedTime: number;
	private deltaTime: number;
	private onUpdate: (deltaTime: number) => void;

	constructor(fps: number, onUpdateFn: (deltaTime: number) => void) {
		this.deltaTime = 1 / fps;
		this.accumulatedTime = 0;
		this.lastTime = 0;
		this.isRunning = false;
		this.onUpdate = onUpdateFn;
	}

	updateProxy(time: number) {
		if (!this.isRunning) return;

		if (this.lastTime) {
			this.accumulatedTime += (time - this.lastTime) / 1000;

			if (this.accumulatedTime > 1) {
				this.accumulatedTime = 1;
			}

			while (this.accumulatedTime > this.deltaTime) {
				this.onUpdate(this.deltaTime);
				this.accumulatedTime -= this.deltaTime;
			}
		}

		this.lastTime = time;

		this.enqueue();
	}

	enqueue() {
		requestAnimationFrame(this.updateProxy.bind(this));
	}

	start() {
		this.isRunning = true;
		this.enqueue();
	}

	stop() {
		this.isRunning = false;
	}
}
