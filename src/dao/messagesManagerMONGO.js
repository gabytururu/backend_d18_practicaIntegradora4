import { messagesModel } from "./models/messagesModel.js"

export class MessagesManagerMONGO {

    async getMessages(){
        return await messagesModel.find()
    }

    async postMessage(message){              
        return await messagesModel.create(message)
    }
}