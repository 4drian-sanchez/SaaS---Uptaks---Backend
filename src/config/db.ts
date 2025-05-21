import mongoose from "mongoose";
import {exit} from 'node:process'
import colors from 'colors'


const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.DB_URL)
        const url = `${connection.host}:${connection.port}`
        console.log(colors.blue.bold(`Base de datos conectada en ${url}`))
    } catch (error) {
        console.log(colors.bold.red('Error al conectar a mongoDB'))
        exit(1)
    }
}

export default connectDB