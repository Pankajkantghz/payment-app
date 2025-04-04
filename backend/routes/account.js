import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { Account } from "../db.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId,
    });
    res.json({
        balance: account.balance,
    });
});

router.post("/transfer", authMiddleware,async (req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    const {amount , to} = req.body;

    const account = await Account.findOne({
        userId:req.userId
    }).session(session);

    if(!account || account.balance<amount){
        await session.abortTransaction();
        return res.status(400).json({
            message:"Insufficient balance or invalid account"
        })
    }

    const toAccount = await Account.findOne({userId: to}).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: 'Invalid Account'
        });
    }

    await Account.updateOne({userId:req.userId},{$inc:{balance:account.balance - amount}}).session(session);

    await Account.updateOne({userId:to},{$inc:{balance:amount}}).session(session);
    await session.commitTransaction();
    res.json({
        message:"Transfer successful"
    })
});
export default router;
