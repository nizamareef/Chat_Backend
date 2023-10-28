const express=require('express');
const User = require('../Model/User');
const Chat = require('../Model/Chat');
const Message=require('../Model/Message')
const fetchdata = require('../middleware/jwt_verify');
const router=express.Router();

//Search---user
router.get("/search/:key",async(req,res)=>{
    try{
        const data=await User.find(
            {$or:[{name:{$regex:req.params.key}}]}
          )
          if (data.length===0){
            res.send("No user found")
          }
          res.send(data);
        }
        catch {
            console.log("No user found ");
            // res.status(500).send("Server error")
        }
})

//Create or Access the chat
router.post('/accessChat', fetchdata, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.userId; // The currently authenticated user

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.status(400).json({ error: "UserId not provided" });
    }

    // Check if a chat with these users already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [currentUser, userId] }
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (existingChat) {
      // Return the existing chat
      res.status(200).send(existingChat);
    } else {
      // Create a new chat
      // Create a new chat
const newChat = new Chat({
  users: [currentUser, userId],
});

// Save the new chat
const savedChat = await newChat.save();

// Fetch user details and populate them
await Chat.populate(savedChat, {
  path: "users",
  select: "-password", // Exclude the password field
});

// Optionally, create a welcome message for the new chat
const welcomeMessage = new Message({
  chat: savedChat._id,
  sender: currentUser,
  text: `Welcome to the chat with ${userId}!`,
});

const savedWelcomeMessage = await welcomeMessage.save();

// Update the chat with the welcome message
savedChat.latestMessage = savedWelcomeMessage._id;
await savedChat.save();

// Return the newly created chat
res.status(201).json(savedChat);

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Fetch chat
router.get('/chats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Use the Chat model to find chats related to the specified user
    const chats = await Chat.find({
      users: userId, // Assuming "users" is an array of user IDs in your Chat model
    })
    .populate('users', '-password') // Populate user details excluding password
    .populate('latestMessage');

    // Send the chat data as a JSON response
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//group name

router.post("/group",fetchdata,async(req,res)=>{
  
    if(!req.body.name || !req.body.users){
      return res.send("enter the name and users");
    }
    var users=JSON.parse(req.body.users);
    if(users.length<2){
      return  res.send("you must have atleast two members") ;}
      users.push(req.userId);
      try {
        const groupChat=await Chat.create({
          chatName:req.body.name,
          users:users,
          isGroupChat:true,
          groupAdmin:req.userId
        })
         const fullGroupChat=await Chat.findOne(groupChat._id)
        .populate("users","-password")
        .populate("groupAdmin","-password")
        res.status(200).json(fullGroupChat)
    }


  catch (error) {
    res.status(400).send("errorsyr ")
  }
})

//Rename grp

router.post("/rename",async(req,res)=>{
  const {chatId,chatName}=req.body;
  const updatedChat=await Chat.findByIdAndUpdate(chatId,{
    chatName
  },{new:true}).populate('users',"-password").populate('groupAdmin','-password')
  res.status(200).send(updatedChat)
})

//Add to grp

router.post('/add',async(req,res)=>{
  const{chatId,userId}=req.body
  const addedUser = await Chat.findByIdAndUpdate(chatId,{
  $push:{users:userId}  
  },{new:true})
  
  .populate('users','-password')
  .populate('groupAdmin','-password')
  res.status(200).send(addedUser)
})

//Remove from grp

router.post('/removeuser',async(req,res)=>{
  const {userId,chatId}=req.body;
  const removeUser=await Chat.findByIdAndUpdate(chatId,{
    $pull:{users:userId}
  },{new:true})
  .populate('users','-password')
  .populate('groupAdmin','-password')
  res.status(200).send(removeUser)
})
module.exports=router;