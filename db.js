const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config()

const connectDB= async()=>{
    try{
        const connection= await mongoose.connect(process.env.MONGODB,{
            useNewUrlParser:true,
            useUnifiedTopology:true,

        });
        console.log("succesfully connected to Mongodb")
    }catch{
        console.log("Error connecting to database")
    }
}
module.exports=connectDB