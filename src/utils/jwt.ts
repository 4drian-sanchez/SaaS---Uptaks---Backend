import JWT from 'jsonwebtoken'
import {Types} from 'mongoose'

type UserPayload = {
    id: Types.ObjectId
} 
const generarJWT = ( payload : UserPayload ) => {
    const token = JWT.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '180d'
    })
    return token
}

export default generarJWT