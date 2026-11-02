import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";
import { randomUUID } from "node:crypto";
const { Schema, model } = mongoose;
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    lastName: {
        type: String,
        trim: true, //for no space if extra space is there
        required: true,
        maxLength: 50,
    },
});

const accountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    balancePaise: {
        type: Number,
        required: true,
        min: 0,
    },
});

const transactionSchema = new Schema({
    type: { type: String, enum: ["transfer", "demo_fund"], required: true },
    referenceId: { type: String, required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amountPaise: { type: Number, required: true, min: 1 },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const User = model("User", userSchema);
export const Account = model("Account", accountSchema);
export const Transaction = model("Transaction", transactionSchema);

export async function connectDatabase() {
    await mongoose.connect(MONGODB_URI);

    // Older versions stored rupees as floating point numbers. Convert those
    // records once, before serving requests, and keep all wallet math in paise.
    await Account.collection.updateMany(
        { balancePaise: { $exists: false }, balance: { $type: "number" } },
        [{ $set: { balancePaise: { $round: [{ $multiply: ["$balance", 100] }, 0] } } }],
    );
    await Transaction.collection.updateMany(
        { amountPaise: { $exists: false }, amount: { $type: "number" } },
        [{ $set: { amountPaise: { $round: [{ $multiply: ["$amount", 100] }, 0] } } }],
    );
    const [accountsMissingPaise, transactionsMissingPaise] = await Promise.all([
        Account.collection.countDocuments({ balancePaise: { $exists: false } }),
        Transaction.collection.countDocuments({ amountPaise: { $exists: false } }),
    ]);
    if (accountsMissingPaise || transactionsMissingPaise) {
        throw new Error("Wallet data migration could not convert every legacy amount to paise");
    }
    await Promise.all([
        Account.collection.updateMany({ balance: { $exists: true } }, { $unset: { balance: "" } }),
        Transaction.collection.updateMany({ amount: { $exists: true } }, { $unset: { amount: "" } }),
    ]);

    const missingReferences = await Transaction.find({
        $or: [{ referenceId: { $exists: false } }, { referenceId: null }],
    }).select("_id").lean();
    for (const record of missingReferences) {
        const referenceId = `WLT-${randomUUID().replaceAll("-", "").toUpperCase()}`;
        await Transaction.updateOne(
            { _id: record._id, $or: [{ referenceId: { $exists: false } }, { referenceId: null }] },
            { $set: { referenceId } },
        );
    }
    await Transaction.collection.createIndex({ referenceId: 1 }, { unique: true });
}
