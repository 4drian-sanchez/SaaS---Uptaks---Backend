import mongoose, { Document, Schema, Types } from 'mongoose'

interface IToken extends Document {
    token: string
    user: Types.ObjectId
    createdAt: Date
}

const TokenSchema : Schema = new Schema({
    token: {
        type: String,
        require: true
    },
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        default: () => Date.now(),
        expires: '10min'
    }
})

const Token = mongoose.model<IToken>('Token', TokenSchema)
export default Token