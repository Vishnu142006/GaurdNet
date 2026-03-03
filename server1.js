const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = 5000;

/* ==========================================
   POSTGRESQL CONNECTION
========================================== */

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "guardnet",
  password: "Bhavik@2006", 
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.log("❌ DB Error:", err));


/* ==========================================
   CREATE TABLES
========================================== */

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      account VARCHAR(50),
      toaccount VARCHAR(50),
      amount INT,
      country VARCHAR(50),
      device VARCHAR(100),
      ipaddress VARCHAR(50),
      status VARCHAR(20) DEFAULT 'ACTIVE',
      time BIGINT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50),
      user_account VARCHAR(50),
      reason TEXT,
      time TIMESTAMP
    );
  `);

  console.log("✅ Tables Ready");
}

createTables();


/* ==========================================
   SMART RISK ENGINE (Optimized)
========================================== */

async function calculateRisk(tx) {

  let score = 0;

  // High amount rules
  if (tx.amount > 100000) score += 50;
  else if (tx.amount > 50000) score += 30;

  // Get previous transaction of same account
  const previousTx = await pool.query(
    `SELECT * FROM transactions
     WHERE account = $1 AND id < $2
     ORDER BY time DESC LIMIT 1`,
    [tx.account, tx.id]
  );

  if (previousTx.rows.length > 0) {

    const prev = previousTx.rows[0];
    const timeDiff = (tx.time - prev.time) / 1000;

    // Country jump within 2 minutes
    if (timeDiff < 120 && tx.country !== prev.country)
      score += 40;

    // Device change
    if (tx.device !== prev.device)
      score += 25;

    // IP change within 30 sec
    if (timeDiff < 30 && tx.ipaddress !== prev.ipaddress)
      score += 30;
  }

  return Math.min(score, 100);
}


/* ==========================================
   ROUTES
========================================== */

// Get all transactions
app.get("/api/transactions", async (req, res) => {
  const data = await pool.query(
    "SELECT * FROM transactions ORDER BY time DESC"
  );
  res.json(data.rows);
});


// Run detection
app.get("/api/detect", async (req, res) => {

  const allTx = await pool.query("SELECT * FROM transactions");
  let suspicious = [];

  for (let tx of allTx.rows) {

    const riskScore = await calculateRisk(tx);

    if (riskScore > 85 && tx.status === "ACTIVE") {

      await pool.query(
        "UPDATE transactions SET status='LOCKED' WHERE id=$1",
        [tx.id]
      );

      await pool.query(
        `INSERT INTO events(type, user_account, reason, time)
         VALUES($1,$2,$3,$4)`,
        ["ACCOUNT_LOCKED", tx.account, "High Risk Detected", new Date()]
      );
    }

    if (riskScore >= 60)
      suspicious.push({ ...tx, riskScore });
  }

  res.json(suspicious);
});


// Get latest cyber events
app.get("/api/cyber-events", async (req, res) => {
  const events = await pool.query(
    "SELECT * FROM events ORDER BY time DESC LIMIT 10"
  );
  res.json(events.rows);
});


/* ==========================================
   RANDOM IP GENERATOR
========================================== */

function generateRandomIP() {
  return `${Math.floor(Math.random() * 255)}.` +
         `${Math.floor(Math.random() * 255)}.` +
         `${Math.floor(Math.random() * 255)}.` +
         `${Math.floor(Math.random() * 255)}`;
}


/* ==========================================
   LIVE SIMULATION
========================================== */

setInterval(async () => {

  const countries = ["India", "China", "USA", "UAE", "Nigeria", "Singapore"];
  const devices = ["iPhone/Safari", "Android/Chrome", "Windows/Firefox", "Mac/Chrome"];
  const accounts = ["ACX-7782","ACX-9911","ACX-4478","ACX-8899","ACX-3321"];

  const newTx = {
    account: accounts[Math.floor(Math.random() * accounts.length)],
    toaccount: accounts[Math.floor(Math.random() * accounts.length)],
    amount: Math.floor(Math.random() * 150000),
    country: countries[Math.floor(Math.random() * countries.length)],
    device: devices[Math.floor(Math.random() * devices.length)],
    ipaddress: generateRandomIP(),
    time: Date.now()
  };

  await pool.query(
    `INSERT INTO transactions
     (account, toaccount, amount, country, device, ipaddress, time)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      newTx.account,
      newTx.toaccount,
      newTx.amount,
      newTx.country,
      newTx.device,
      newTx.ipaddress,
      newTx.time
    ]
  );

  console.log("📡 New Transaction Added");

}, 15000);


/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, () => {
  console.log(`🚀 GuardNet PostgreSQL running on http://localhost:${PORT}`);
});