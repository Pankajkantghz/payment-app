import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { Account, Transaction } from "../db.js";
import mongoose from "mongoose";
import { DEMO_FUNDING_ENABLED } from "../config.js";
import { User } from "../db.js";
import { randomBytes, randomUUID, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const router = express.Router();
const scrypt = promisify(scryptCallback);
const createReferenceId = () => `WLT-${randomUUID().replaceAll("-", "").toUpperCase()}`;
const toPaise = (amount) => Math.round(amount * 100);
const hasAtMostTwoDecimals = (amount) => Math.abs(amount * 100 - toPaise(amount)) < 1e-7;

router.get("/balance", authMiddleware, async (req, res, next) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        if (!account) return res.status(404).json({ message: "Account not found" });
        return res.json({ balance: account.balancePaise / 100 });
    } catch (error) { return next(error); }
});

router.post("/demo-funds", authMiddleware, async (req, res, next) => {
    if (!DEMO_FUNDING_ENABLED) {
        return res.status(403).json({ message: "Demo funding is disabled" });
    }
    const amount = req.body?.amount;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 100_000 || !hasAtMostTwoDecimals(amount)) {
        return res.status(400).json({ message: "Enter a demo amount between ₹0.01 and ₹100,000" });
    }
    const amountPaise = toPaise(amount);
    let session;
    try {
        session = await mongoose.startSession();
        let updatedBalance;
        await session.withTransaction(async () => {
            const account = await Account.findOneAndUpdate(
                { userId: req.userId },
                { $inc: { balancePaise: amountPaise } },
                { new: true, session },
            );
            if (!account) throw Object.assign(new Error("Account not found"), { status: 404 });
            updatedBalance = account.balancePaise / 100;
            await Transaction.create([{ type: "demo_fund", referenceId: createReferenceId(), toUserId: req.userId, amountPaise }], { session });
        });
        return res.json({ message: "Demo funds added", balance: updatedBalance });
    } catch (error) { return next(error); }
    finally { if (session) await session.endSession(); }
});

router.post("/demo-recipient", authMiddleware, async (req, res, next) => {
    if (!DEMO_FUNDING_ENABLED) {
        return res.status(403).json({ message: "Demo recipients are disabled" });
    }
    const username = "demo@wallet.test";
    try {
        let user = await User.findOne({ username }).select("firstName lastName");
        if (!user) {
            const salt = randomBytes(16).toString("hex");
            const randomPassword = randomBytes(32).toString("hex");
            const key = await scrypt(randomPassword, salt, 64);
            user = await User.create({
                username,
                password: `${salt}:${key.toString("hex")}`,
                firstName: "Demo",
                lastName: "Recipient",
            });
        }
        await Account.updateOne(
            { userId: user._id },
            { $setOnInsert: { balancePaise: 0, userId: user._id } },
            { upsert: true },
        );
        return res.status(201).json({ user: { _id: user._id, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        if (error.code === 11000) {
            try {
                const user = await User.findOne({ username }).select("firstName lastName");
                if (user) return res.json({ user: { _id: user._id, firstName: user.firstName, lastName: user.lastName } });
            } catch (lookupError) { return next(lookupError); }
        }
        return next(error);
    }
});

router.post("/transfer", authMiddleware, async (req, res, next) => {
    const amount = req.body?.amount;
    const to = req.body?.to;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000 || !hasAtMostTwoDecimals(amount)) {
        return res.status(400).json({ message: "Enter a positive amount with no more than two decimal places" });
    }
    const amountPaise = toPaise(amount);
    if (!mongoose.isValidObjectId(to)) return res.status(400).json({ message: "Recipient account is invalid" });
    if (String(to) === String(req.userId)) return res.status(400).json({ message: "You cannot transfer money to yourself" });

    let session;
    try {
        session = await mongoose.startSession();
        let failure;
        let transferReferenceId;
        await session.withTransaction(async () => {
            failure = undefined;
            const recipient = await Account.findOne({ userId: to }).session(session);
            if (!recipient) { failure = { status: 404, message: "Recipient account not found" }; return; }
            const debit = await Account.updateOne(
                { userId: req.userId, balancePaise: { $gte: amountPaise } },
                { $inc: { balancePaise: -amountPaise } },
                { session },
            );
            if (debit.modifiedCount !== 1) {
                failure = { status: 400, message: "Insufficient balance or sender account not found" };
                return;
            }
            await Account.updateOne({ userId: to }, { $inc: { balancePaise: amountPaise } }, { session });
            transferReferenceId = createReferenceId();
            await Transaction.create([{ type: "transfer", referenceId: transferReferenceId, fromUserId: req.userId, toUserId: to, amountPaise }], { session });
        });
        if (failure) return res.status(failure.status).json({ message: failure.message });
        return res.json({ message: "Transfer successful", referenceId: transferReferenceId, amount: amountPaise / 100 });
    } catch (error) { return next(error); }
    finally { if (session) await session.endSession(); }
});

router.get("/transactions", authMiddleware, async (req, res, next) => {
    try {
        const records = await Transaction.find({
            $or: [{ fromUserId: req.userId }, { toUserId: req.userId }],
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("fromUserId", "firstName lastName")
            .populate("toUserId", "firstName lastName")
            .lean();
        const transactions = records.map((record) => {
            const incoming = record.type === "transfer" && String(record.toUserId?._id) === String(req.userId);
            const counterparty = record.type === "demo_fund"
                ? null
                : (incoming ? record.fromUserId : record.toUserId);
            return {
                id: record._id,
                referenceId: record.referenceId,
                type: record.type,
                direction: record.type === "demo_fund" ? "demo_fund" : (incoming ? "received" : "sent"),
                amount: record.amountPaise / 100,
                date: record.createdAt,
                counterparty: counterparty ? `${counterparty.firstName} ${counterparty.lastName}` : null,
            };
        });
        return res.json({ transactions });
    } catch (error) { return next(error); }
});

export default router;
