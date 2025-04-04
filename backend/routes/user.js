import express from "express";
import zod, { string } from "zod";
import { Account, User } from "../db.js";
import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

//did zod validation
const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
});
// I have to bcrypt validation for password

router.post("/signup", async (req, res) => {

    const { username, password, firstName, lastName } = req.body;
    const { success } = signupBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "incorrect input",

        });
    }

    const existingUser = await User.findOne({
        username,
    });

    if (existingUser) {
        return res.status(411).json({
            message: "User already exists",
        });
    }

    const users = await User.create({
        username,
        password,
        firstName,
        lastName,
    });

    const userId = users._id;

    await Account.create({
        userId,
        balance:1+Math.random()*1000
    })

    const token = jwt.sign({ userId }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token,
    });
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})
// I have to bcrypt validation for password
router.post("/signin", async (req, res) => {
    const {username, password} = req.body;
    const { success } = signinBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "incorrect inputs"
        })
    }

    const user =await User.findOne({ username, password })
   
    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })


})

const userBody = zod.object({
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
})

router.put("/", authMiddleware, async (req, res) => {
    const { password , firstName, lastName } = req.body;

    const success = userBody.safeParse(req.body);

    if(!success){
        return res.status(411).json({message:"Error while updating the information"})
    }

    await User.updateOne ({_id:req.userId},req.body)
    res.json({
        message: "Updated successfully"
    })


})

router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }
        },{
            lastName:{
                "$regex":filter
            }
        }]
    })
    res.json({
        user:users.map(user =>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

export default router;
