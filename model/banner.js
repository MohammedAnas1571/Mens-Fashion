const mongoose = require("mongoose")


const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,

    },
    subTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        require: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    isBlock: {
        type: Boolean,
        default: false
    }
})
const Banner = mongoose.model(
    "banner",
    bannerSchema
)
module.exports = Banner