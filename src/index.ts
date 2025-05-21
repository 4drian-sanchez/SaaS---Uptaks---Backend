import app from './server'

const PORT = process.env.PORT || 4000

app.listen( PORT, () => {
    console.log(`La aplicacion se esta ejecuntado en el puerto ${PORT}`)
} )