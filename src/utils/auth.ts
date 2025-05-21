import bcryptjs from 'bcryptjs'

export const hashPassword = async ( passowrd : string) => {
    const salt = await bcryptjs.genSalt(10)
    return await bcryptjs.hash(passowrd, salt)
}

export const comparePassword = (pass : string, hashPass : string) => {
    return bcryptjs.compare(pass, hashPass)
}

export const generateToken = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}