const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize SQLite database
const db = new sqlite3.Database(path.resolve(__dirname, "../db/refriagro.db"));

// Create tables
db.serialize(() => {
  // Contacts table (extended)
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whatsapp_number TEXT UNIQUE,
    chatwoot_contact_id TEXT,
    chatwoot_conversation_id TEXT,
    name TEXT,
    company TEXT,
    location TEXT,
    equipment_type TEXT,
    last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversation_state TEXT DEFAULT 'initial',
    demand_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Conversations table
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    message_type TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_bot_message BOOLEAN DEFAULT 0,
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
  )`);

  // Demands table
  db.run(`CREATE TABLE IF NOT EXISTS demands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    demand_type TEXT,
    equipment_type TEXT,
    description TEXT,
    urgency TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
  )`);

  // Customer data cache
  db.run(`CREATE TABLE IF NOT EXISTS customer_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whatsapp_number TEXT UNIQUE,
    customer_data TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Demand summaries table
  db.run(`CREATE TABLE IF NOT EXISTS demand_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whatsapp_number TEXT,
    summary TEXT,
    demand_type TEXT DEFAULT 'problem',
    status TEXT DEFAULT 'pending',
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
