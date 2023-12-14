const dotenv = require("dotenv")
const express = require("express");
const userRouter = require("./router/userRouter")
const adminRouter = require("./router/adminRouter")

const session = require("express-session");
const nocache = require("nocache");
const cookie = require("cookie-parser");
const morgan = require("morgan")
const mongoose = require ("mongoose")
const path = require('path')

dotenv.config({path:"./config.env"})



const app = express();
app.set('view engine', 'ejs');

// Set EJS as the view engine
app.set('views',path.join(__dirname,'views'));

app.use(morgan('tiny'));



app.use(express.static(path.join(__dirname,'public')));
  console.log(process.env.MONGO_URL)

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(nocache())




mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


app.use(session({
    secret: "abcdefg",
    resave: false,
    saveUninitialized: true
}))

app.use("/", userRouter)
app.use("/admin",adminRouter)
app.all("/*",(req,res)=>res.render("404"))



  const port = process.env.PORT
  console.log(process.env.MONGO_URL)
app.listen(port, () => { console.log("server is running ") })