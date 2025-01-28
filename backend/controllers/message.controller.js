import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req,res) =>{
    try {
        const senderId = req.id;
        const reciverId = req.params.id;
        const {textMessage:message} = req.body;

        let conversation  = await Conversation.findOne({
            participants:{$all:[senderId,reciverId]}
        });
        //establish the conversation if not started yet...
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId ,reciverId]
            });
        };

        const newMessage = await Message.create({
             senderId,
             reciverId,
             message
        });
        if(newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(),newMessage.save()]);

        //Implement Socket io For Real Time data transfer 
        const receiverSocketId = getReceiverSocketId(reciverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage)
        }


        return res.status(201).json({
            success:true,
            newMessage
        })
    
    } catch (err) {
        console.log(err);
    }
};

 export const getMessage = async(req,res)=>{

    try {
        const senderId = req.id;
        const reciverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all:[senderId,reciverId]}
        }).populate('messages');
        if(!conversation) return res.status(200).json({success:true,messages:[]});
        
        return res.status(200).json({success:true, messages:conversation?.messages});

    } catch (err) {
        console.log(err)
    }

}