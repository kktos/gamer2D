export default interface GameEvent {
	type: string;
	x: number;
	y: number;
	buttons?: number;
	key?: string;
	// wheel event data
	deltaX: number;
	deltaY: number;
	deltaZ: number;
}
