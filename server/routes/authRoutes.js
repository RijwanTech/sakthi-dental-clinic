
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    console.log("Admin email configured:", Boolean(process.env.ADMIN_EMAIL));
    console.log("Password hash configured:", Boolean(process.env.ADMIN_PASSWORD_HASH));
    console.log("JWT secret configured:", Boolean(process.env.JWT_SECRET));

    const validEmail =
      email.trim().toLowerCase() ===
      (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

    const validPassword =
      await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH || ""
      );

    if (!validEmail || !validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        email: process.env.ADMIN_EMAIL,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
});

export default router;
