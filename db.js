const mongoose = require("mongoose");
const DB_URL = "mongodb://localhost:27017/23CSR228";

async function connectDB(){
    try{
        await mongoose.connect(DB_URL)
        .then(()=>{console.log("Connected to the database successfully")})
        .catch((err)=>{console.error("Error connecting to the database:", err)});

    }catch(err){
        console.error("Error connecting to the database:", err);
    }
}

module.exports = {
    connectDB
};