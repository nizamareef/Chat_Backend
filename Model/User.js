const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    pic:{
        type:String,default:"https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg"
    }
},
{
    timestamp:true
})

module.exports=mongoose.model('User',userSchema)