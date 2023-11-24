const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
  userName: { type: String, required: true },
  email: { type: String, required: true,unique:true},
  mobile: { type: String, required: true },
  line1: { type: String, required: true },
  place: {type: String,required: true },
  post: { type: String, required: true },
  postcode: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true }
});

const User = mongoose.model('Address', userSchema);

module.exports = User;
