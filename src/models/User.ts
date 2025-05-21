import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
}

const UserSchema : Schema = new Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true,
        trim: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model<IUser>('User', UserSchema)
export default User