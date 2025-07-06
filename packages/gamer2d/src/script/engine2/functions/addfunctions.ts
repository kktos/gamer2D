import { fnEntity } from "./entity.function";
import { fnExtractFields } from "./extractfields.function";
import { addFunction } from "./functions.store";
import { fnGoto } from "./goto.function";
import { fnLog } from "./log.function";
import { fnInt, fnRandom } from "./math.function";
import { fnSpawn } from "./spawn.function";
import { fnTimer } from "./timer.function";

export function addFunctions() {
	addFunction("log", fnLog);
	addFunction("entity", fnEntity);
	addFunction(["random", "rand", "rnd"], fnRandom);
	addFunction("int", fnInt);
	addFunction("timer", fnTimer);
	addFunction("goto", fnGoto);
	addFunction("extractFields", fnExtractFields);
	addFunction("spawn", fnSpawn);
}
