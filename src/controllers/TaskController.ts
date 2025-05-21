import {Request, Response} from 'express'
import Task from '../models/Task'

class TaskController {

    static createTask = async ( req : Request, res: Response ) => { 
        try {        
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Error en el controller createTask'})
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({project: req.project.id}).populate('project')
            res.status(200).json(tasks)
        } catch (error) {
            res.status(500).json({error: 'Error en el controller getProjectTasks'})
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                .populate({ path: 'completedBy.user', select: 'name email id'})
                .populate({path: 'notes', populate: {path: 'createdBy', select: 'name email id'}})
            res.status(200).json(task)
        } catch (error) {
            res.status(500).json({error: 'Error en el controller getTaskById'})
        }
    }

    static updatedTask = async (req: Request, res: Response) => {
        try {
            await req.task.updateOne(req.body)
            res.send('Tarea actualizada')
        } catch (error) {
            res.status(500).json({error: 'Error en el controller updatedTask'})      
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            //Actualizar el arreglo de tareas en el modelo del proyecto
            req.project.tasks = req.project.tasks.filter( id => id.toString() !== req.task.id.toString())

            await Promise.allSettled([req.project.save(), req.task.deleteOne()])
            res.send('Tarea eliminada correctamente')

        } catch (error) {
            res.status(500).json({error: 'Error en el controller deleteTask'})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const {status} = req.body
            req.task.status = status

            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data)
            req.task.save()
            res.send('Tarea actualizada')

        } catch (error) {
            res.status(500).json({error: 'Error en el controller updateStatus'})
        }
    }
}

export default TaskController