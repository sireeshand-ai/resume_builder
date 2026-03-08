
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");


const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("./resumes.db");

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT,
    data TEXT,
    html_snapshot TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);


// ---------------------- CREATE ----------------------

app.post("/resume", (req, res) => {

  const data = req.body;

  const requiredFields = [
    "name","email","objective","projects","skills","experience","strengths",
    "fatherName","dob","age","sex","marital","phone","languages",
    "hobbies","nationality","address","declaration","date","signature","template"
  ];

  // Check required fields
  for (let field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === "") {
      return res.status(400).json({
        error: `${field} is required`
      });
    }
  }

  // Check education
  if (!data.education || !Array.isArray(data.education) || data.education.length === 0) {
    return res.status(400).json({ error: "At least one education entry is required" });
  }

  const jsonData = JSON.stringify(data);
  const slug = data.name || "Untitled Resume";
  const html_snapshot = data.html_snapshot || "";

  db.run(
    `INSERT INTO resumes (slug, data, html_snapshot) VALUES (?, ?, ?)`,
    [slug, jsonData, html_snapshot],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ id: this.lastID });
    }
  );
});


// ---------------------- READ ALL ----------------------
app.get("/resumes", (req, res) => {
  db.all("SELECT * FROM resumes", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------------------- READ ONE ----------------------
app.get("/resume/:id", (req, res) => {
  db.get("SELECT * FROM resumes WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Resume not found" });

    // Parse data back into JSON
    try {
      row.data = JSON.parse(row.data);
    } catch (e) {
      row.data = {};
    }

    res.json(row);
  });
});


// ---------------------- UPDATE ----------------------
app.put("/resume/:id", (req, res) => {
  const { name, email, education, percentage, yearOfPassing, projects, skills, photo, template } = req.body;

  db.run(
    `UPDATE resumes SET 
      name = ?, 
      email = ?, 
      education = ?, 
      percentage = ?, 
      yearOfPassing = ?, 
      projects = ?, 
      skills = ?, 
      photo = ?, 
      template = ?
     WHERE id = ?`,
    [name, email, education, percentage, yearOfPassing, projects, skills, photo, template, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Resume not found" });
      res.json({ updated: true });
    }
  );
});

// ---------------------- DELETE ----------------------
app.delete("/resume/:id", (req, res) => {
  db.run("DELETE FROM resumes WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Resume not found" });
    res.json({ deleted: true });
  });
});

// ---------------------- START SERVER ----------------------
app.listen(4000, () => console.log("✅ Server running at http://localhost:4000"));        



