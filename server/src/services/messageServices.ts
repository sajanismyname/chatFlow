import { AppDataSource } from "../config/dataSource.js";
import { Message } from "../entities/Message.js";

const messageRepository = AppDataSource.getRepository(Message);

export const createMessage = async ({
    userId,
    conversationId,
    content
}:{
    userId: number,
    conversationId: number,
    content: string
}) =>{
    const message = messageRepository.create({
        content : content.trim(),

        sender: {
            id:userId
        },

        conversation: {
            id: conversationId
        }

    })

    const savedMessage = await messageRepository.save(message)

    const completeMessage = await messageRepository.findOne({
        where: {
            id: savedMessage.id,
        },
        relations: {
            sender: true
        }
    })

    return completeMessage
}