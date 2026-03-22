//1st-VERSION with bonus features for events/listeners/event emitter and game-log.txt file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionsPath = path.join(__dirname, 'data', 'sessions.json');
const bestsPath = path.join(__dirname, 'data', 'bests.json');

// difficulties
export const DIFFICULTY = {
  easy: { min: 1, max: 50 },
  hard: { min: 1, max: 100 }
};

// helper functions
function readJSON(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// GAME CLASS WITH EVENTS
export class Game extends EventEmitter {
  constructor() {
    super();
  }

  isValidDifficulty(input) {
    return input === 'easy' || input === 'hard';
  }

  getRandomNumber(difficultyId) {
    const { min, max } = DIFFICULTY[difficultyId];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  validateGuess(input, difficultyId) {
    const trimmed = input.trim();
    const num = Number(trimmed);
    const { min, max } = DIFFICULTY[difficultyId];

    if (!Number.isInteger(num) || num < min || num > max) {
      // emit invalid event
      this.emit('invalidGuess', {
        difficultyId,
        rawInput: trimmed
      });
      return null;
    }

    return num;
  }

  checkGuess(guess, secret, difficultyId) {
    if (guess > secret) {
      this.emit('guess', { difficultyId, guessValue: guess, outcome: 'high' });
      return 'high';
    }
    if (guess < secret) {
      this.emit('guess', { difficultyId, guessValue: guess, outcome: 'low' });
      return 'low';
    }

    this.emit('guess', { difficultyId, guessValue: guess, outcome: 'win' });
    return 'win';
  }

  saveSession(difficultyId, guessCount) {
    const sessions = readJSON(sessionsPath, []);

    const session = {
      id: uuidv4(),
      difficultyId,
      guessCount,
      completedAt: new Date().toISOString()
    };

    sessions.push(session);
    writeJSON(sessionsPath, sessions);

    return session;
  }

  updateBest(difficultyId, session) {
    const bests = readJSON(bestsPath, { easy: null, hard: null });
    const currentBest = bests[difficultyId];

    if (!currentBest || session.guessCount < currentBest.guessCount) {
      bests[difficultyId] = {
        guessCount: session.guessCount,
        sessionId: session.id,
        setAt: new Date().toISOString()
      };

      writeJSON(bestsPath, bests);
    }
  }

  getSummary() {
    const sessions = readJSON(sessionsPath, []);
    const bests = readJSON(bestsPath, { easy: null, hard: null });

    return { sessions, bests };
  }
}


//2nd-VERSION without bonus features for events/listeners/event emitter and game-log.txt file
/*import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionsPath = path.join(__dirname, "data", "sessions.json");
const bestsPath = path.join(__dirname, "data", "bests.json");

// difficulty config
export const DIFFICULTY = {
  easy: { min: 1, max: 50 },
  hard: { min: 1, max: 100 },
};

// helpers
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function isValidDifficulty(input) {
  return input === "easy" || input === "hard";
}

export function getRandomNumber(difficultyId) {
  const { min, max } = DIFFICULTY[difficultyId];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function validateGuess(input, difficultyId) {
  const num = Number(input);
  const { min, max } = DIFFICULTY[difficultyId];

  if (!Number.isInteger(num) || num < min || num > max) {
    return null;
  }

  return num;
}

export function saveSession(difficultyId, guessCount) {
  const sessions = readJSON(sessionsPath);

  const session = {
    id: uuidv4(),
    difficultyId,
    guessCount,
    completedAt: new Date().toISOString(),
  };

  sessions.push(session);
  writeJSON(sessionsPath, sessions);

  return session;
}

export function updateBest(difficultyId, session) {
  const bests = readJSON(bestsPath);
  const currentBest = bests[difficultyId];

  if (!currentBest || session.guessCount < currentBest.guessCount) {
    bests[difficultyId] = {
      guessCount: session.guessCount,
      sessionId: session.id,
      setAt: new Date().toISOString(),
    };

    writeJSON(bestsPath, bests);
  }
}

export function getSummary() {
  const sessions = readJSON(sessionsPath);
  const bests = readJSON(bestsPath);

  return { sessions, bests };
}*/


