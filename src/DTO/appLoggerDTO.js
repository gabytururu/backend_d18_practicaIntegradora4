//work in progress-- pendiente verificar si este DTO se puede homologar con el de req/endpoints para que la estructura de mensajes de error sea siempre igual?

export class appLoggerDTO{
    constructor(error){
        
        this.name=error.name
        this.cause=error.message
        this.stack=error.stack
    }
}