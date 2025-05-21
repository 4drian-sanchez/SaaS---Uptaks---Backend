import {Request, Response, NextFunction} from 'express'
import Task, { ITask } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists( req: Request, res: Response, next: NextFunction ) {
    try {
        const {taskId} = req.params
        const task = await Task.findById(taskId)

        if(!task) {
            return res.status(404).json({error: 'Tarea no encontrada'})
        }

        req.task = task
        next()
    } catch (error) {
        console.log(error)
    }
}

export async function taskBelongsToProject( req: Request, res: Response, next: NextFunction ) {
    if(req.task.project.toString() !== req.project.id.toString()) {
        return res.status(400).json({error: 'Accion no válida'})
    }
    next()
}

export function hasAuthorization( req: Request, res: Response, next: NextFunction ) {
    if(req.project.manager.toString() !== req.user.id.toString()) {
        return res.status(400).json({error: 'Accion no válida'})
    }
    next()
}