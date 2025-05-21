import { Router } from "express";
import ProjectController from '../controllers/ProjectController'
import { body, param } from "express-validator";
import handleInputsErrors from "../middlewares/validation";
import TaskController from "../controllers/TaskController";
import { projectExists } from "../middlewares/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middlewares/task";
import authenticate from "../middlewares/auth";
import TeamMemberController from "../controllers/TeamController";
import  NoteController from '../controllers/NoteController'

const router = Router()

/**Routes del proyecto */
//Coloca el middleware authenticate a todas las rutas de este archivo
/* authenticate */
router.use(authenticate)

//Crea un proyecto
router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacia'),
    handleInputsErrors,
    ProjectController.createProject
)

//Muestra los proyectos
router.get('/',  ProjectController.getAllprojects )

router.get('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    ProjectController.getProjectById
)

router.put('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacia'),
    handleInputsErrors,
    ProjectController.updatedProject
)

router.delete('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    ProjectController.deleteProject
)

/**Routes of Tasks
 * Esta estrucura de escribir la rutas se le connoce como
 * Nested Resource Routing
 */
router.param('projectId', projectExists)

// Crear una tarea
router.post('/:projectId/tasks',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputsErrors,
    TaskController.createTask
)

// Obtener todas las tareas
router.get('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    TaskController.getProjectTasks
)

//MIddlewares para las tareas
router.param('taskId', taskExists) //Si la tarea existe la devuelve en req.task
router.param('taskId', taskBelongsToProject)//Devuelve solo las tareas que pertenecen al proyecto

//Obtiene una tarea por su ID
router.get('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    TaskController.getTaskById
)

//Actualiza una tarea
router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion es obligatoria'),
    handleInputsErrors,
    TaskController.updatedTask
)

//Elimina una tarea
router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('projectId').isMongoId().withMessage('ID no válido'),
    body('status')
        .notEmpty().withMessage('El estado no puede ir vacio'),
    handleInputsErrors,
    TaskController.updateStatus
)

/**TEAM ROUTES */
router.get('/:projectId/team', 
    TeamMemberController.getTeamProject
)

router.post('/:projectId/team/find', 
    body('email').isEmail().withMessage('Email no válido'),
    handleInputsErrors,
    TeamMemberController.getMemberByEmail
)

router.post('/:projectId/team', 
    body('id').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId', 
    param('projectId').isMongoId().withMessage('ID no válido'),
    param('userId').isMongoId().withMessage('ID no válido'),
    handleInputsErrors,
    TeamMemberController.removeMemberById
)
/*   /project/678cfaf15b1cc0d30d08ef24?editTask=678d47a4415606474b50dbdd */
/*** Routes of Notes ***/

//Crear Nota
router.post( '/:projectId/task/:taskId/note',
    body('content')
        .notEmpty().withMessage('La nota no puede ir vacia'),
    handleInputsErrors,
    NoteController.createNote
 )

//Obtener notas de una tarea
router.get('/:projectId/task/:taskId/note',
    NoteController.getNotes
)

//Elimina una nota
router.delete( '/:projectId/task/:taskId/note/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    handleInputsErrors,
    NoteController.deleteNote
)

export default router