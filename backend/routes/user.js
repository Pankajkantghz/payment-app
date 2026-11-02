import express from "express";
import { z } from "zod";
import { Account, User } from "../db.js";
import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/authMiddleware.js";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const router = express.Router();
const scrypt = promisify(scryptCallback);
const isPasswordHash = (value) => /^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(value);
const hashPassword = async (password) => {
    const salt = randomBytes(16).toString("hex");
    const key = await scrypt(password, salt, 64);
    return `${salt}:${key.toString("hex")}`;
};
const verifyPassword = async (password, stored) => {
    if (!isPasswordHash(stored)) return stored === password;
    const [salt, keyHex] = stored.split(":");
    const key = Buffer.from(keyHex, "hex");
    const candidate = await scrypt(password, salt, key.length);
    return key.length === candidate.length && timingSafeEqual(key, candidate);
};
const issueToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

const signupBody = z.object({
    username: z.string().trim().email().max(254),
    firstName: z.string().trim().min(1).max(50),
    lastName: z.string().trim().min(1).max(50),
    password: z.string().min(8).max(128),
});

router.post("/signup", async (req, res, next) => {
    try {
        const parsed = signupBody.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Enter a valid email, name, and password (at least 8 characters)." });
        const { username, password, firstName, lastName } = parsed.data;
        const normalizedUsername = username.toLowerCase();
        if (await User.exists({ username: normalizedUsername })) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }
        const user = await User.create({
            username: normalizedUsername,
            password: await hashPassword(password),
            firstName,
            lastName,
        });
        await Account.create({ userId: user._id, balancePaise: 0 });
        return res.status(201).json({ message: "Account created successfully", token: issueToken(user._id) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists" });
        return next(error);
    }
});

const signinBody = z.object({ username: z.string().trim().email().max(254), password: z.string().min(1).max(128) });
router.post("/signin", async (req, res, next) => {
    try {
        const parsed = signinBody.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password" });
        const user = await User.findOne({ username: parsed.data.username.toLowerCase() }).select("+password");
        if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
            return res.status(401).json({ message: "Email or password is incorrect" });
        }
        if (!isPasswordHash(user.password)) {
            user.password = await hashPassword(parsed.data.password);
            await user.save();
        }
        return res.json({ token: issueToken(user._id) });
    } catch (error) { return next(error); }
});

router.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("firstName lastName username");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ user });
    } catch (error) { return next(error); }
});

router.get("/bulk", authMiddleware, async (req, res, next) => {
    try {
        const filter = String(req.query.filter || "").trim().slice(0, 50);
        const escapedFilter = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const users = await User.find({
            _id: { $ne: req.userId },
            $or: [
                { firstName: { $regex: escapedFilter, $options: "i" } },
                { lastName: { $regex: escapedFilter, $options: "i" } },
            ],
        }).select("firstName lastName").limit(25);
        return res.json({ user: users });
    } catch (error) { return next(error); }
});

export default router;
