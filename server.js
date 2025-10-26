import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./authRoutes.js";
import authenticateToken from "./authMiddleware.js"; // NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic route for testing server
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Authentication routes (register/login)
app.use("/auth", authRoutes);

// ======================
// 🔐 PROTECTED EXPENSE ROUTES
// ======================

// Get all expenses for the logged-in user
app.get("/expenses", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY id ASC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching expenses:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new expense
app.post("/expenses", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, category, description } = req.body;

    const result = await pool.query(
      "INSERT INTO expenses (user_id, amount, category, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, amount, category, description]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding expense:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an expense
app.patch("/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category, description } = req.body;

    const result = await pool.query(
      "UPDATE expenses SET amount = $1, category = $2, description = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [amount, category, description, id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Expense not found or unauthorized" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating expense:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete an expense
app.delete("/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Expense not found or unauthorized" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
