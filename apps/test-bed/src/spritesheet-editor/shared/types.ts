export type TCommand = {
	id: string;
	data?: unknown;
};
export type TCommandEvent = CustomEvent<TCommand>;
