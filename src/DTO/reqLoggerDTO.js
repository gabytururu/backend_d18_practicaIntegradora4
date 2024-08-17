export class reqLoggerDTO{
    constructor(req,error){
        this.source=`ReqMethod:${req.method}, endpoint ${req.url}`,
        this.userId= req.session.user?req.session.user._id:`N/A: Public`,
        this.userEmail=req.session.user?req.session.user.email:`N/A: Public`,     
        this.userAgent=this.getUserAgent(req) 
        this.name=error?error.name:'N/A no errors detected',
        this.cause=error?error.message:'N/A no errors detected',
        this.stack=error?error.stack:'N/A no errors detected'
    }

    getUserAgent(req){
        const userAgentIndex= req.rawHeaders.findIndex(el=> el==="User-Agent")+1        
        return req.rawHeaders[userAgentIndex]
    }
}