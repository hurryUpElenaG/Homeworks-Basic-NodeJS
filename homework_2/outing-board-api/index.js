import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// __dirname setup (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTINGS_FILE = join(__dirname, 'data', 'outings.json');
const LOGGER_FILE = join(__dirname, 'data', 'outings-logger.txt');

const app = express();

// PORT
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());

// Logger middleware (console + file)
app.use(async (req, res, next) => {
  const logLine = `${new Date().toISOString()} ${req.method} ${req.url}\n`;

  // Log to console
  console.log(logLine.trim());

  try {
    // Append to file
    await fs.appendFile(LOGGER_FILE, logLine);
  } catch (err) {
    console.error('Failed to write log file:', err);
  }

  next();
});

// Helpers
async function readOutingsJSONFile(filePath) {
    try{
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
		console.error(error);
		return [];  
	}
  
}

async function writeOutingsJSONFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Validation
function validateOuting(data, isPost = true) {
  const { title, venue, city, startsAt, isFree } = data;

  const isNonEmptyString = (fieldValue) =>
    typeof fieldValue === "string" && fieldValue.trim().length > 0;

  const isValidDate = (dateValue) =>
    !isNaN(new Date(dateValue).getTime());

  // Validate string fields (only if provided)
  if (title !== undefined && !isNonEmptyString(title)) {
    return "Invalid title";
  }

  if (venue !== undefined && !isNonEmptyString(venue)) {
    return "Invalid venue";
  }

  if (city !== undefined && !isNonEmptyString(city)) {
    return "Invalid city";
  }

  // Validate date
  if (startsAt !== undefined && !isValidDate(startsAt)) {
    return "Invalid startsAt date";
  }

  // Validate isFree
  if (isPost) {
    if (typeof isFree !== "boolean") {
      return "isFree must be a boolean";
    }
  } else {
    if (isFree !== undefined && typeof isFree !== "boolean") {
      return "isFree must be a boolean";
    }
  }

  return null;
}

// ================= ROUTES =================

// GET all (with filters)
app.get('/api/outings', async (req, res, next) => {
  try {
    let outings = await readOutingsJSONFile(OUTINGS_FILE);

    const { city, isFree } = req.query;

    if (city) {
      outings = outings.filter(o =>
        o.city.toLowerCase().trim() === city.toLowerCase().trim()
      );
    }

    if (isFree !== undefined) {
      const bool = isFree === 'true';
      outings = outings.filter(o => o.isFree === bool);
    }

    res.json(outings);
  } catch (err) {
    next(err);
  }
});

// GET by ID
app.get('/api/outings/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const outings = await readOutingsJSONFile(OUTINGS_FILE);
    const outing = outings.find(o => o.id === id);

    if (!outing) {
      return res.status(404).json({ error: `Outing with ID:${id} not found` });
    }

    res.json(outing);
  } catch (err) {
    next(err);
  }
});

// POST
app.post('/api/outings', async (req, res, next) => {
  try {
    const error = validateOuting(req.body, true);
    if (error) return res.status(400).json({ error });

    const outings = await readOutingsJSONFile(OUTINGS_FILE);

    const newOuting = {
      id: uuidv4(),
      ...req.body
    };

    outings.push(newOuting);
    await writeOutingsJSONFile(OUTINGS_FILE,outings);

    res.status(201).json(newOuting);
  } catch (err) {
    next(err);
  }
});

// PUT
app.put('/api/outings/:id', async (req, res, next) => {
  try {
    const error = validateOuting(req.body, false);
    if (error) return res.status(400).json({ error });

    const id = req.params.id;
    const outings = await readOutingsJSONFile(OUTINGS_FILE);
    const index = outings.findIndex(o => o.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Outing with ID: ${id} not found` });
    }

    outings[index] = { 
        ...outings[index], // keep id and any unchanged fields
        ...req.body // overwrite with new values for title, venue, city, startsAt, isFree if provided
    };

    await writeOutingsJSONFile(OUTINGS_FILE, outings);

    res.json(outings[index]);
  } catch (err) {
    next(err);
  }
});

// DELETE
app.delete('/api/outings/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const outings = await readOutingsJSONFile(OUTINGS_FILE);
    const index = outings.findIndex(o => o.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Outing with ID: ${id} not found` });
    }

    outings.splice(index, 1);

    await writeOutingsJSONFile(OUTINGS_FILE, outings);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// STATS
app.get('/api/stats', async (req, res, next) => {
  try {
    const outings = await readOutingsJSONFile(OUTINGS_FILE);

    const total = outings.length;

    const byCity = {};

    outings.forEach(o => {
        (byCity[o.city]) ? (byCity[o.city] = byCity[o.city] + 1) : (byCity[o.city] = 1);  //same result as byCity[o.city] = (byCity[o.city] || 0) + 1;
    });
    const now = new Date();

    const future = outings
      .filter(o => new Date(o.startsAt) >= now)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

    const nextEvent = future[0] || null;

    res.json({ total, byCity, nextEvent });
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});