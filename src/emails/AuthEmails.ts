import { transport } from "../config/nodemailer"

interface Imail {
    email: string
    name: string
    token: string
}

class AuthEmail {
    static async sendConfirmationEmail(user : Imail) {
        transport.sendMail({
            from: 'admin@uptask.com',
            to: user.email,
            subject: 'Confima tu cuenta',
            text: 'Confirma tu cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
            <p>Visita el siguiente enlace <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a> E ingresa el codigo <b>${user.token}<b/> <p/>
            `

        })
    }
    static async sendForgodPassword(user : Imail) {
        transport.sendMail({
            from: 'admin@uptask.com',
            to: user.email,
            subject: 'Cambiar contraseña',
            text: 'Instrucciones para cambiar tu contraseña',
            html: `<p>Hola ${user.name}</p>
            <p>Visita el siguiente enlace para restablecer tu contraseña <a href="${process.env.FRONTEND_URL}/auth/new-password">cambiar contraseña</a> </br> E ingresa el siguiente codigo <b>${user.token}<b/> <p/>
            `
        })
    }
}

export default AuthEmail