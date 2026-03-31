import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/auth.js";
import { prisma } from "../utils/prisma.js";
import { sendEmail } from "../utils/mailer.js";
import { logUserActivity } from "../utils/activityLog.js";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const login = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.issues });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Send welcome email on first login for students
    if (user.role === "student" && !user.firstLoginAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { firstLoginAt: new Date() },
      });

      const { subject, body } = buildWelcomeEmail(user.email);
      sendEmail(user.email, subject, body)
        .catch((err) => console.error("Failed to send welcome email:", err.message));
    }

    // Capture previous lastLoginAt before updating
    const previousLoginAt = user.lastLoginAt;

    // Update lastLoginAt to now
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userAgent = req.headers["user-agent"] || null;
    const ipAddress =
      (req.headers["x-forwarded-for"] || "")
        .toString()
        .split(",")[0]
        .trim() ||
      req.ip ||
      null;

    logUserActivity(user.id, "login", userAgent, ipAddress);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toUpperCase(),
      },
      lastLoginAt: previousLoginAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }

    const decoded = verifyToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const currentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        degreeProgram: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      ok: true,
      user: {
        ...user,
        role: user.role.toUpperCase(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const buildWelcomeEmail = (studentName) => {
  return {
    subject: "Welcome to eTutor!",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to eTutor!</h2>
          <p>Dear ${studentName || "Student"},</p>
          <p>Welcome to the eTutor platform! We're excited to have you on board.</p>
          <p>Here are some things you can do to get started:</p>
          <ul>
            <li>Send a message to your personal tutor</li>
            <li>Check out blog posts from your tutor</li>
            <li>Schedule a meeting with your tutor</li>
            <li>Upload documents for feedback</li>
          </ul>
          <p>Regular engagement with your tutor will help you succeed in your studies. Don't hesitate to reach out!</p>
          <p>Best regards,<br/>The eTutor Team</p>
        </div>`
  };
}