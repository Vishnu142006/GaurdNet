🛡️ GuardNet – Fraud Detection Backend


GuardNet is a Fraud Detection Backend System built using Node.js, Express, and PostgreSQL.
It simulates real-time banking transactions and detects suspicious activity using a smart rule-based risk engine.

🚀 Features

✅ Automatic PostgreSQL table creation

✅ Smart fraud risk scoring engine

✅ Automatic account locking for high-risk activity

✅ Cyber event logging system

✅ Live transaction simulation (every 15 seconds)

✅ REST API architecture

🧠 Fraud Detection Logic

Each transaction is scored based on:

Rule	Risk Points
Amount > 100000	+50
Amount > 50000	+30
Country change within 2 minutes	+40
Device change	+25
IP change within 30 seconds	+30

🔒 Risk > 85 → Account LOCKED

⚠ Risk ≥ 60 → Marked as Suspicious

🎯 Max Score = 100

📂 Project Structure
guardnet-backend/
│
├── server.js
├── package.json
├── package-lock.json
└── public/

Main file defined in package.json 

package

🛠️ Tech Stack

Node.js

Express.js

PostgreSQL

pg (node-postgres)

CORS

REST API

Dependencies are listed in:

package.json 

package

package-lock.json 

package-lock

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/guardnet-backend.git
cd guardnet-backend
2️⃣ Install Dependencies
npm install
3️⃣ Setup PostgreSQL

Make sure PostgreSQL is installed and running.

Create database:

CREATE DATABASE guardnet;
4️⃣ Configure Database

Update the database configuration inside server.js:

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "guardnet",
  password: "YOUR_PASSWORD",
  port: 5432,
});

⚠️ Important: Do NOT push real passwords to GitHub.
Use environment variables for production.

5️⃣ Start Server
npm start

Server runs at:

http://localhost:5000
📡 API Endpoints
🔹 Get All Transactions
GET /api/transactions
🔹 Run Fraud Detection
GET /api/detect

Locks high-risk accounts and returns suspicious transactions.

🔹 Get Latest Cyber Events
GET /api/cyber-events
🔄 Live Simulation

Every 15 seconds:

Random transaction generated

Stored in database

Can be analyzed using /api/detect

This simulates real-world banking activity.

🔐 Production Improvements (Recommended)

Use .env for DB credentials

Add JWT authentication

Add Rate limiting

Add Helmet security middleware

Add Docker support

Deploy on:

Render

Railway

Fly.io

AWS / Azure

🌍 Deployment Note

⚠ Netlify is for frontend only.
Deploy backend separately (Render / Railway etc.).

👨‍💻 Author

Bhavik
GuardNet Fraud Detection Backend
Version 1.0.0
