const HIGHSCORES_COUNT = 10;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class LocalDB {
	static keys() {
		const keys: string[] = [];
		for (let idx = 0; idx < localStorage.length; idx++) {
			const key = localStorage.key(idx);
			if (key) keys.push(key);
		}
		return keys;
	}

	static levels(theme: string) {
		let keys = LocalDB.keys();
		const re = new RegExp(`^\./levels/${theme}/`);
		keys = keys.filter((key) => key.match(re)).sort();
		return keys.map((key) => ({ key, name: key.replace(/^\.\/levels\//, "") }));
	}

	static saveLevel(theme: string, name: string, data: unknown) {
		localStorage.setItem(`./levels/${theme}/${name}`, JSON.stringify(data));
	}

	static loadResource(name: string) {
		const data = localStorage.getItem(name);
		return data ? JSON.parse(data) : null;
	}

	static currentPlayer() {
		return {
			score: Number(localStorage.getItem("player:score")) | 0,
			lives: Number(localStorage.getItem("player:lives")) | 0,
			name: localStorage.getItem("player:name"),
			round: Number(localStorage.getItem("player:round")) | 0,
			highscore: LocalDB.highscore(), //localStorage.getItem("player:highscore")|0
		};
	}

	static newPlayer(name: string) {
		localStorage.setItem("player:score", String(0));
		localStorage.setItem("player:lives", String(3));
		localStorage.setItem("player:name", name);
		localStorage.setItem("player:round", String(-1));
	}

	static updateName(name) {
		localStorage.setItem("player:name", name);
	}
	static updateLives(lives) {
		localStorage.setItem("player:lives", String(lives | 0));
	}
	static updateScore(score) {
		localStorage.setItem("player:score", String(score | 0));
	}
	static updateRound(round) {
		localStorage.setItem("player:round", String(round | 0));
	}

	static highscores() {
		const scores = localStorage.getItem("player:highscores");
		return scores ? JSON.parse(scores) : [];
	}

	static highscore() {
		const scores = LocalDB.highscores();
		scores?.sort((a, b) => (a.score < b.score ? 1 : -1));
		return scores?.[0]?.score ?? 0;
	}

	static isPlayerScoreGoodEnough() {
		const lastGame = LocalDB.currentPlayer();
		const highscores = LocalDB.highscores();
		return !highscores.length || highscores.length < HIGHSCORES_COUNT || highscores.some((i) => i.score < lastGame.score);
	}

	static updateHighscores() {
		const lastGame = LocalDB.currentPlayer();
		let highscores = LocalDB.highscores();
		highscores.push({
			name: lastGame.name,
			round: lastGame.round,
			score: lastGame.score,
		});
		highscores.sort((a, b) => (a.score < b.score ? 1 : -1));
		highscores = highscores.slice(0, HIGHSCORES_COUNT);
		localStorage.setItem("player:highscore", highscores[highscores.length - 1].score);
		localStorage.setItem("player:highscores", JSON.stringify(highscores));
	}
}
