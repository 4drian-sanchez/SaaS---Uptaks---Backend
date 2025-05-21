import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { body, param } from "express-validator";
import handleInputsErrors from "../middlewares/validation";
import authenticate from "../middlewares/auth";

const router = Router()

router.post( '/create-account',
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email').isEmail().withMessage('Email no válido'),
    body('password').isLength({min: 8}).withMessage('La contraseña debe tener almenos 8 caracteres'),
    body('password2').custom( (value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Las contraseñas son diferentes')
        }
        return true
    } ),
    handleInputsErrors,
    AuthController.createAccount
 )

 router.post('/confirm-account',
    body('token').notEmpty().withMessage('El token no puede ir vacio'),
    handleInputsErrors,
    AuthController.confirmarAccount
 )

 router.post('/login', 
    body('email')
        .notEmpty().withMessage('El correo no puede ir vacio')
        .isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('La contraseña no debe ir vacia'),
    handleInputsErrors,
    AuthController.login
 )

 router.post('/request-code', 
    body('email')
        .notEmpty().withMessage('El correo no puede ir vacio')
        .isEmail().withMessage('Email no válido'),
    handleInputsErrors,
    AuthController.requestCode
 )

 router.post('/forgot-password', 
    body('email')
        .notEmpty().withMessage('El correo no puede ir vacio')
        .isEmail().withMessage('Email no válido'),
    handleInputsErrors,
    AuthController.forgotPassword
)

 router.post('/validate-token', 
    body('token').notEmpty().withMessage('El token no puede ir vacio'),
    handleInputsErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no valido'),
    body('password').isLength({min: 8}).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas son diferentes');
        }
        return true;
    }),
    handleInputsErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user', 
    authenticate,
    AuthController.user
)

router.put('/profile', 
    authenticate,
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('email').isEmail().withMessage('Email no válido'),
    handleInputsErrors,
    AuthController.updateProfile
)

router.post('/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('Introduce tu contraseña actual'),
    body('password').isLength({min: 8}).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas son diferentes');
        }
        return true;
    }),
    handleInputsErrors,
    AuthController.updatePassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('Introduce tu contraseña'),
    handleInputsErrors,
    AuthController.checkPassword
)

export default router