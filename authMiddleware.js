import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Token is sent as: Bearer <token>
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info (id, username)
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

export default authenticateToken;
