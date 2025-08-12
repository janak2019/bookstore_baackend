const mongoose = require('mongoose')

const connectDB = async (URI)=>{

try{
    await mongoose.connect(URI)
    console.log("Database connect successfully");
    
}catch(error){
    console.error('MongoDB connection failed',error.message)
    process.exit(1)
}



}
module.exports = connectDB