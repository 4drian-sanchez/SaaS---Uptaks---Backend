import { Request, Response, NextFunction } from "express";
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import User, { IUser } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

const authenticate = async (req: Request, res: Response, next: NextFunction ) => {
    const bearer = req.headers.authorization
    if(!bearer) {
        const error = new Error('No autorizado')
        return res.status(401).json({error: error.message})
    }

    const [, token] = bearer.split(' ')
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id name email')
            req.user = user
        }else{
            return res.status(409).json({ error: 'Token inválido o no autorizado' })
        }
        
    } catch (error) {
        return res.status(500).json({ error: 'Token inválido o no autorizado' })
    }
    next()
}

export default authenticate