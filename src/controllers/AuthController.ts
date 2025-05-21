import { Request, Response } from "express";
import User from "../models/User";
import { comparePassword, generateToken, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import AuthEmail from "../emails/AuthEmails";
import generarJWT from "../utils/jwt";

class AuthController {
    static createAccount = async ( req: Request, res: Response ) => {
        try {
            const {password, email} = req.body

            //Verificando si el usuario ya existe
            const userExists = await User.findOne({email})
            if(userExists) {
                const error = new Error('Correo electrónico registrado')
                return res.status(409).json({error: error.message})
            }

            //Creando el usuario
            const user = new User(req.body)
            user.password = await hashPassword(password)
            
            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar email
            AuthEmail.sendConfirmationEmail({
                email,
                name: user.name, 
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta creada, revisa tu email para confirmar tu cuenta')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error al crear tu cuenta'})
        }
    }

    static confirmarAccount = async ( req: Request, res: Response ) => {

        try {    
            //Obteniendo el token y valdidando si existe        
            const {token} = req.body
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            //Confirmando el usuario y eliminado el token
            const user = await User.findById(tokenExists.user)
            user.confirmed = true
            await Promise.allSettled([ user.save(), tokenExists.deleteOne() ])
            res.status(200).send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error al crear tu cuenta'})
            
        }
    }

    
    static login = async ( req: Request, res: Response ) => {
        const {email, password} = req.body

        //Comprueba si el usuario esta registrado
        const user = await User.findOne({email})
        if(!user) {
            const error = new Error('Usuario no registrado')
            return res.status(404).json({error: error.message})
        }

        //Comprueba si el usuario confirmo su cuenta
        if(!user.confirmed) {
            //generando nuevo token
            const token = new Token()
            token.user = user.id
            token.token = generateToken()
            token.save()

            //Enviar email
            AuthEmail.sendConfirmationEmail({
                email,
                name: user.name, 
                token: token.token
            })
            const error = new Error('No haz confirmado tu cuenta, revisa tu correo')
            return res.status(401).json({error: error.message})
        }

        //Comprueba si la contraseña es incorrecto
        const validatePass = await comparePassword(password, user.password)
        if(!validatePass) {
            const error = new Error('Contraseña incorrecta')
            return res.status(400).json({ error: error.message })
        }
        
        //Genera el JWT
        const jwt = generarJWT({id: user.id })
        res.status(200).send(jwt)

        try {  
        } catch (error) {
            res.status(500).json({error: 'Hubo un error al crear tu cuenta'})
            
        }
    }

    
    static requestCode = async ( req: Request, res: Response ) => {
        const {email} = req.body

        //Comprueba si el usuario esta registrado
        const user = await User.findOne({email})
        if(!user) {
            const error = new Error('Usuario no registrado')
            return res.status(404).json({error: error.message})
        }

        //Comprueba si el usuario confirmo su cuenta
        if(user.confirmed) {
            const error = new Error('Ya confirmaste tu cuenta')
            return res.status(401).json({error: error.message})
        }

        //generando nuevo token
        const token = new Token()
        token.user = user.id
        token.token = generateToken()
        token.save()

        //Enviar email
        AuthEmail.sendConfirmationEmail({
            email,
            name: user.name, 
            token: token.token
        })

        res.send('Código de verificación enviado')
        try {  
        } catch (error) {
            res.status(500).json({error: 'Hubo un error al crear tu cuenta'})
            
        }
    }
    
    static forgotPassword = async ( req: Request, res: Response ) => {
        const {email} = req.body

        try {  
        //Comprueba si el usuario esta registrado
        const user = await User.findOne({email})
        if(!user) {
            const error = new Error('Usuario no registrado')
            return res.status(404).json({error: error.message})
        }

        //generando nuevo token
        const token = new Token()
        token.user = user.id
        token.token = generateToken()
        token.save()

        //Enviar email
        AuthEmail.sendForgodPassword({
            email,
            name: user.name, 
            token: token.token
        })

        res.send('Revisa tu correo para ver las instrucciones')


        } catch (error) {
            res.status(500).json({error: 'Hubo un error al crear tu cuenta'})
            
        }
    }

    static validateToken = async ( req: Request, res: Response ) => {
        const {token} = req.body
        try {
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            res.send('Token válido. Cambia tu contraseña')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error al crear tu cuenta'})
        }   
    }

    static updatePasswordWithToken = async ( req: Request, res: Response ) => {
        const {token} = req.params
        const {password} = req.body
        try {
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                const error = new Error('Token no valido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            return res.status(200).send('Contraseña cambiada exitosamente')
        } catch (error) {
            
        }
    }

    static user = async ( req: Request, res: Response ) => {
        const user = req.user
        return res.status(200).json(user)
    }

    static updateProfile = async ( req: Request, res: Response ) => {
        const { name, email } = req.body

        const userExists = await User.findOne({email})

        if( userExists && userExists.id.toString() !== req.user.id.toString()){
            const error = new Error('Correo no disponible')
            return res.status(409).json({error: error.message})
        }

        req.user.name = name
        req.user.email = email

        try {
            req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})      
        }
    }

    static updatePassword = async ( req: Request, res: Response ) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const passConfirmation = await comparePassword(current_password, user.password)
        if(!passConfirmation) {
            const error = new Error('Contraseña incorrecta')
            return res.status(409).json({error: error.message})
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('Contraseña actualizada')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})       
        }
    }

    static checkPassword = async ( req: Request, res: Response ) => {

        const {password} = req.body

        try {
            const user = await User.findById(req.user.id)
            const passConfirmation = await comparePassword(password, user.password)

            if(!passConfirmation) {
                const error = new Error('Contraseña incorrecta')
                return res.status(409).json({error: error.message})
            }

            res.status(200).send('validated')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

}

export default AuthController