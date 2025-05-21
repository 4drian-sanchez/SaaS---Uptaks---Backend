import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { corsConfig } from './config/cors'
import morgan from 'morgan'
import connectDB from './config/db'
import projectRoutes from './routes/projectRoutes'
import authRoutes from '../src/routes/authRoutes'

connectDB()

const app = express()

//CORS
app.use(cors(corsConfig))

//Logging
app.use(morgan('dev'))

//Leer datos del servidor
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/project', projectRoutes)

export default app