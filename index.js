require("dotenv").config();
const express = require("express");
const userRouter = require("./router/userRouter")
const adminRouter = require("./router/adminRouter")

const session = require("express-session");
const nocache = require("nocache");
const cookie = require("cookie-parser");
const morgan = require("morgan")
const mongoose = require ("mongoose")





const app = express();
// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(morgan('tiny'));


app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(nocache())



mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(session({
    secret: "abcdefg",
    resave: false,
    saveUninitialized: true
}))


app.use("/", userRouter)
app.use("/admin",adminRouter)



  const port = process.env.PORT

app.listen(port, () => { console.log("server is running ") })