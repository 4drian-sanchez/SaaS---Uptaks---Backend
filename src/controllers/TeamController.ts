import { Request, Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

class TeamMemberController {
    static getMemberByEmail =  async (req: Request, res:Response) => {
        try {
            const {email} = req.body
            const member = await User.findOne({email}).select('_id name email')
            if(!member) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }

            res.status(200).json(member)

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTeamProject = async (req: Request, res:Response) => { 
        const projectId = req.project.id
        const project = await Project.findById(projectId).populate({
            path: 'team',
            select: 'name email id'
        })

        res.json(project.team)

    }

    static addMemberById = async (req: Request, res:Response) => { 
        
        try {
            const {id} = req.body
            const user = await User.findById(id).select('_id')
            if(!user) {
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }

            //Comprobar que el usuario no este en el equipo
            if(req.project.team.some( member => member.toString() === user.id.toString() )) {
                const error = new Error('El usuario ya esta en el equipo')
                return res.status(404).json({error: error.message})
            }

            req.project.team.push(user.id)
            await req.project.save()

            res.send('Usuario agregado al equipo')
            
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static removeMemberById = async (req: Request, res:Response) => { 
        try {
            const {userId} = req.params

            //Comprobar si el usuario no existe en el proyecto
            if(!req.project.team.some( member => member.toString() === userId.toString() )) {
                const error = new Error('El usuario no esta en este proyecto')
                return res.status(404).json({error: error.message})
            }

            req.project.team = req.project.team.filter( member => member.toString() !==  userId.toString())
            await req.project.save()
            res.send('Usuario eliminado del proyecto')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}

export default TeamMemberController