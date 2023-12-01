const mongoose = require("mongoose")


const productCategrySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        require:true,
        unique: true,
    },
    description:{
        type:String,
        require:true
    },
    image:{
        data:Buffer,
        contentType:String
    },
    isBlock :{
        type:Boolean,
        default:false
    }
})
const productCategry = mongoose.model(
    "productCategry",
    productCategrySchema
)
module.exports = productCategry