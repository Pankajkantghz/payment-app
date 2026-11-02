import { JWT_SECRET } from "../config.js";
import jwt from 'jsonwebtoken';

const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message:"Authorization token is required"});
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        if (!decoded.userId) throw new Error("Token has no user id");
        req.userId = decoded.userId;
        next();
    }catch(err){     
        return res.status(401).json({message:"Invalid or expired token"});
    }  

}
export default authMiddleware;
