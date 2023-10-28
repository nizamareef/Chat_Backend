const User = require('../Model/User');
const Chat = require('../Model/Chat');
const Message=require('../Model/Message');
const express=require('express');
const router=express.Router();
const fetchdata = require('../middleware/jwt_verify');

// all messages
router.post('/messages',fetchdata,async(req,res)=>{
    const{content,chatId}=req.body
    if(!content||!chatId){
        return res.status(401).json({msg:'Please provide content and chatId'})
    }

    var newMessage={
        sender:req.userId,
        content:content,
        chat:chatId
    }
    try {
        var message= await Message.create(newMessage);

        message=await message.populate('sender','name pic')
        message=await message.populate("chat")
        message=await User.populate(message,{
            path:"chat.users",
            select:"name pic email "
        });

        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message
        })
        res.json(message);


    } catch (error) {
         res.status(400)
         throw new Error(error.message);
    }
})

//Fetching All messages
router.get("/allMessages/:chatId", fetchdata, async(req, res) =>{
    try {
        const messages=await Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat");
        res.json(messages)
    } catch (error) {
        res.status(400)
         throw new Error(error.message);
    }
})
module.exports=router;