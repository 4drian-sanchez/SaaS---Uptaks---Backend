import { Request, Response } from "express";
import Project from "../models/Project";

class ProjectController {

    static createProject = async ( req: Request, res: Response ) => {
        try {
            const project = new Project(req.body)
            project.manager = req.user
            await project.save()
            res.send('Projecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllprojects = async ( req: Request, res: Response ) => {
        try {        
            const Projects = await Project.find({
                //Filtra los proyectos por usuario
                $or : [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}}
                ]
            })
            res.status(200).json(Projects)

        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async ( req: Request, res: Response ) => {
        const { id } = req.params
        try {        
            const project = await Project.findById(id).populate('tasks')
            if(!project) {
                return res.status(404).json({error: 'El proyecto no existe'})
            }
            
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id) ) {
                return res.status(404).json({error: 'Accion no valida'})
            }

            res.status(200).json(project)

        } catch (error) {
            console.log(error)
        }
    }

    static updatedProject = async ( req: Request, res: Response ) => {
        const { id } = req.params
        try {        
            const project = await Project.findById(id)
            if(!project) {
                return res.status(404).json({error: 'El proyecto no existe'})
            }

            if(project.manager.toString() !== req.user.id.toString() ) {
                return res.status(404).json({error: 'Solo el manager puede actualizar'})
            }

            await project.updateOne(req.body)
            res.send('Proyecto actualizado')

        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async ( req: Request, res: Response ) => { 
        const { id } = req.params
        try {        
            const project = await Project.findById(id)
            if(!project) {
                return res.status(404).json({error: 'El proyecto no existe'})
            }
            
            if(project.manager.toString() !== req.user.id.toString() ) {
                return res.status(404).json({error: 'Solo el manager puede eliminar'})
            }
            
            await project.deleteOne()
            res.send('Proyecto eliominado')

        } catch (error) {
            console.log(error)
        }
    }
}

export default ProjectController