
const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    image:{
        data:Buffer,
        contentType:String
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
    ,
    mobile: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    is_block: {
        type: Number,
        default: false

    },
    is_verified: {
        type: Boolean,
        default: false
    },
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product' // Assuming you have a 'Product' model in your application
        },
        quantity: {
            type: Number,
            default: 1 // Default quantity is 1
        },
        totalAmount: {
            type: Number
        }
    }],
    grandTotal: {
        type: Number,
        default: 0
    },
     code:{
        type:String,
     },
    wallet: {
        type: Number,
        default: 0
    },
    walletHistory: [{
        date: {
            type: Date,
        },
        amount: {
            type: Number
        },
        message: {
            type: String
        }
    }],
   
})


module.exports = mongoose.model("Customer", userSchema)