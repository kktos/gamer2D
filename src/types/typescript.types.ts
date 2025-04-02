export type TupleToUnion<T extends unknown[]> = T[number];
/*
	let action : TupleToUnion<[5,9]>;
	menu= 6;
	// error : Type '6' is not assignable to type '5,9'.
*/

export type RequireNone<KeysType extends PropertyKey> = Partial<Record<KeysType, never>>;
export type RequireAll<ObjectType, KeysType extends keyof ObjectType> = Required<Pick<ObjectType, KeysType>>;
export type RequireAllOrNone<ObjectType, KeysType extends keyof ObjectType = keyof ObjectType> = (RequireAll<ObjectType, KeysType> | RequireNone<KeysType>) &
	Omit<ObjectType, KeysType>;
