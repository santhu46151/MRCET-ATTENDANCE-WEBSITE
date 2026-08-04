const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

const JWT_SECRET = process.env.JWT_SECRET || 'attendance_dashboard_secret_key';

// Initialize SQLite database connection
const dbPath = path.join(__dirname, 'attendance.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database successfully at', dbPath);
    createTables();
  }
});

// Setup Tables
function createTables() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Roster table (stores class roster per user)
    db.run(`
      CREATE TABLE IF NOT EXISTS rosters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE NOT NULL,
        students TEXT NOT NULL, -- JSON array of student structures
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // History table (stores history data per user)
    db.run(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE NOT NULL,
        history TEXT NOT NULL, -- JSON object of date log entries
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  });
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token expired or invalid.' });
    req.user = user;
    next();
  });
}

// Register API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'User already exists with this email.' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User registered successfully.' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, uid: user.id, email: user.email });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync GET Data API
app.get('/api/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    db.get(`SELECT students FROM rosters WHERE userId = ?`, [userId], (err, rosterRow) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.get(`SELECT history FROM history WHERE userId = ?`, [userId], (err, historyRow) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          roster: rosterRow ? JSON.parse(rosterRow.students) : [],
          history: historyRow ? JSON.parse(historyRow.history) : {}
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync POST Data API
app.post('/api/sync', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { roster: students, history } = req.body;

    const saveStatePromise = new Promise((resolve, reject) => {
      db.serialize(() => {
        if (students) {
          db.run(
            `INSERT INTO rosters (userId, students, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(userId) DO UPDATE SET students=excluded.students, updatedAt=CURRENT_TIMESTAMP`,
            [userId, JSON.stringify(students)]
          );
        }

        if (history) {
          db.run(
            `INSERT INTO history (userId, history, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(userId) DO UPDATE SET history=excluded.history, updatedAt=CURRENT_TIMESTAMP`,
            [userId, JSON.stringify(history)],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        } else {
          resolve();
        }
      });
    });

    await saveStatePromise;
    res.json({ success: true, message: 'Data synced successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Node Express Server running locally on port ${PORT}`);
});
