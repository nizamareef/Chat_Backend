const express=require('express');
const {body, validationResult } = require('express-validator');
const router=express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const User=require("../Model/User");
const fetchdata = require('../middleware/jwt_verify');
const dotenv= require("dotenv").config()
JWTSECRET=process.env.SECRET

//SignUp router

router.post("/register",
   [body("name").isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({min:5})
],async(req,res)=>{
    
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(500).json({"error":error.array()})
    }   
    const salt=bcrypt.genSaltSync(10);
    const hash=bcrypt.hashSync(req.body.password,salt)
    let user= await User.findOne({email:req.body.email});
    if (user){
        return res.status(401).json({error:"The email is already registerd"})
    }
     user= await User.create({
        name:req.body.name,
        email: req.body.email ,
        password:hash
     })
     const data={
        id:user._id
     }
     var authtoken=jwt.sign(data,JWTSECRET)
     res.json({authtoken})
})

// Router-2 SIGNIN 
    router.post("/login",[
        body('email').isEmail(),
        body('password')
    ],async(req,res)=>{
        const{email, password}=req.body;
        const user =await User.findOne({email})
        if(!user){
            res.status(401).json({error:"Enter the valid credentials "})
        }
        const passwordcompare=await bcrypt.compare(password,user.password);
        if (!passwordcompare ){
            return   res.status(401).json({error:'Invalid Credentials'})
        }
        const data ={
            userId:user.id
        }
       
        var authtoken=jwt.sign(data,JWTSECRET)
        return res.json({authtoken,user: { ...user.toObject(), password: undefined }
    })
    })

//Router -3 Fetch user
router.get('/details',fetchdata,async(req,res)=>{
    let userid=req.userId
    const user=await User.findById(userid).select('-password')
    res.json(user)
})
module.exports=router;