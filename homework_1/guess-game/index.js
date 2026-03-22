//1st-VERSION with bonus features for events/listeners/event emitter and game-log.txt file
import readline from 'readline/promises';
import { stdin, stdout } from 'process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Game } from './game.js';
import {DIFFICULTY} from './game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logPath = path.join(__dirname, 'data', 'game-log.txt');

const game = new Game();

// EVENT LISTENERS (LOGGING)
game.on('guess', ({ difficultyId, guessValue, outcome }) => {
  const line = `${new Date().toISOString()} ${difficultyId} guess=${guessValue} outcome=${outcome}\n`;
  fs.appendFileSync(logPath, line);
});

game.on('invalidGuess', ({ difficultyId, rawInput }) => {
  const line = `${new Date().toISOString()} ${difficultyId} invalid input="${rawInput}"\n`;
  fs.appendFileSync(logPath, line);
});

// readline
const rl = readline.createInterface({ 
  input: stdin, 
  output: stdout 
});

//show menu
function showMenu() {
	console.log('\nGuess the Number');
	console.log("1) New game  2) Summary  3) Exit");
}

// GAME FLOW
async function startGame() {
  let difficulty;

  while (true) {
    difficulty = await rl.question('\nDifficulty (easy / hard): ');
    if (game.isValidDifficulty(difficulty)) break;
    console.log('Invalid difficulty.');
  }

  const secret = game.getRandomNumber(difficulty);
  let guesses = 0;

  while (true) {
    const input = await rl.question('\nYour guess: ');
    const guess = game.validateGuess(input, difficulty);

    if (guess === null) {
      const { min, max } = DIFFICULTY[difficulty];
      console.log(`Enter a whole number between ${min} and ${max}.`);
      continue;
    }

    guesses++;

    const result = game.checkGuess(guess, secret, difficulty);

    if (result === 'high') {
      console.log('too high');
    } else if (result === 'low'){
      console.log('too low');
    } else {
      console.log(`correct — ${guesses} guesses.`);

      const session = game.saveSession(difficulty, guesses);
      game.updateBest(difficulty, session);

      break;
    }
  }
}

// SUMMARY
function showSummary() {
  const { sessions, bests } = game.getSummary();

  console.log('\n--- Best scores ---');
  console.log('easy:', bests.easy);
  console.log('hard:', bests.hard);

  console.log('--- Sessions ---');
  console.log('Total:', sessions.length);

  const last5 = sessions.slice(-5);
  console.log(last5);
}

// MENU
async function menu() {
	console.log('Welcome to the Game App!');
	try {
		while (true) {
			showMenu();
			const choice = await rl.question('\nChoice: ');
			switch (choice) {
				case '1':
					await startGame();
					break;
				case '2':
					showSummary();
					break;
				case '3':
          console.log("Bye.");
          rl.close();
          process.exit(0);
					break;
				default:
					console.log(`Invalid choice. Try using options 1-3.`);
			}
		}
	} catch (error) {
		if (error.code !== 'ERR_USE_AFTER_CLOSE') {
			console.error('Something went wrong. Please try again later.');

			rl.close();
			process.exit(1);
		}
	}
}

menu();


//2nd-VERSION without bonus features for events/listeners/event emitter and game-log.txt file
/*import readline from 'readline/promises';
import { stdin, stdout } from 'process';
import {
  DIFFICULTY,
  isValidDifficulty,
  getRandomNumber,
  validateGuess,
  saveSession,
  updateBest,
  getSummary
} from './game.js';

const rl = readline.createInterface({ input: stdin, output: stdout });

function showMenu() {
	console.log('\nGuess the Number');
	console.log("1) New game  2) Summary  3) Exit");
}

// GAME FLOW
async function startGame() {
  let difficulty;

  while (true) {
    difficulty = await rl.question('\nDifficulty (easy / hard): ');
    if (isValidDifficulty(difficulty)) break;
    console.log('Invalid difficulty.');
  }

  const secret = getRandomNumber(difficulty);
  let guesses = 0;

  while (true) {
    const input = await rl.question('\nYour guess: ');
    const guess = validateGuess(input, difficulty);

    if (guess === null) {
      const { min, max } = DIFFICULTY[difficulty];
      console.log(`Enter a whole number between ${min} and ${max}.`);
      //console.log('Enter a whole number in range.');
      continue;
    }

    guesses++;

    if (guess > secret) {
      console.log('too high');
    } else if (guess < secret) {
      console.log('too low');
    } else {
      console.log(`correct — ${guesses} guesses.`);

      const session = saveSession(difficulty, guesses);
      updateBest(difficulty, session);

      break;
    }
  }
}


// SUMMARY
function showSummary() {
  const { sessions, bests } = getSummary();

  console.log('\n--- Best scores ---');
  console.log('easy:', bests.easy);
  console.log('hard:', bests.hard);

  console.log('--- Sessions ---');
  console.log('Total:', sessions.length);

  // last 5 sessions
  const last5 = sessions.slice(-5);
  console.log(last5);
}

async function main() {
	console.log('Welcome to the Game App!');
	try {
		while (true) {
			showMenu();
			const choice = await rl.question('\nChoice: ');
			switch (choice) {
				case '1':
					await startGame();
					break;
				case '2':
					showSummary();
					break;
				case '3':
          console.log("Bye.");
          rl.close();
          process.exit(0);
					break;
				default:
					console.log(`Invalid choice. Try using options 1-3.`);
			}
		}
	} catch (error) {
		if (error.code !== 'ERR_USE_AFTER_CLOSE') {
			console.error('Something went wrong. Please try again later.');

			rl.close();
			process.exit(1);
		}
	}
}

main();*/

/*Guess the Number
1) New game  2) Summary  3) Exit
Choice: 1
Difficulty (easy / hard): easy
Your guess: 40
too high
Your guess: 10
too low
Your guess: hello
Enter a whole number between 1 and 50.
Your guess: 23
correct — 3 guesses.

1) New game  2) Summary  3) Exit
Choice: 2

--- Best scores ---
easy: { guessCount: 3, sessionId: '…', setAt: '…' }
hard: null
--- Sessions ---
Total: 1
[ { id: '…', difficultyId: 'easy', guessCount: 3, completedAt: '…' } ]

1) New game  2) Summary  3) Exit
Choice: 3
Bye.*/



