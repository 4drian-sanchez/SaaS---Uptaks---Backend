import { Request, Response } from "express";
import Note, { INote } from "../models/NoteModel";
import { Types } from "mongoose";

interface INoteParam {
    noteId: Types.ObjectId
}

class NoteController {
    static createNote = async ( req: Request<{}, {}, INote>, res: Response) => {
        const {content} = req.body
        
        const note = new Note()
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        try {
            await Promise.allSettled([ req.task.save(), note.save() ])
            res.send('Nota creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'hubo un error'})
        }
    }

    static getNotes = async ( req: Request<{}, {}, INote>, res: Response)  => {
        try {
            const notes = await Note.find({task: req.task.id})
            res.json(notes)
        } catch (error) {
            res.status(500).json({error: 'hubo un error'})    
        }
    }

    static deleteNote = async ( req: Request<INoteParam>, res: Response)  => {
        const { noteId } = req.params
        const note = await Note.findById(noteId)

        if(!note) {
            const error = new Error('Nota no encontrada')
            return res.status(404).json({error: error.message})
        }

        if(note.createdBy.toString() !== req.user.id.toString())  {
            const error = new Error('Acción no válida')
            return res.status(409).json({error: error.message})
        }

        try {           
            req.task.notes = req.task.notes.filter( noteFilter => noteFilter.id.toString() !== note.id.toString() )
            await Promise.allSettled([ req.task.save(), note.deleteOne()])
            res.send('Nota eliminada correctamente')

        } catch (error) {
            res.status(500).json({error: 'hubo un error'})    
        }
    }
}

export default NoteController