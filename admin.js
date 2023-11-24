const mongoose  = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./model/adminModel');
require("dotenv").config();

const {securepassword} = require ("./utils/passwordHash")



mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const seedAdmin = async ()=>{
    try{
    const admin = process.env.ADUSERNAME
    const password = process.env.ADPASSWORD

    const hashedPassword = await securepassword(password,10)
    await Admin.create({
        name : admin,
        password : hashedPassword
    })
        console.log('Admin created successfully');
        process.exit();
} catch(error){
    
        console.log(err)
        process.exit(1);
} }



seedAdmin();