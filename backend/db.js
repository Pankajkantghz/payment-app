import mongoose from "mongoose";
const { Schema, model } = mongoose;
mongoose.connect("mongodb://localhost:27017/paytm");
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
        minLength: 8,
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
        required: true
    },
    balance: {
        type: Number,
        required: true,
    },
});
export const User = model("User", userSchema);
export const Account = model("Account", accountSchema);
