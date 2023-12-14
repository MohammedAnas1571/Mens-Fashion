const randomString = require("randomstring")
const nodeMailer = require("nodemailer")
const UserOTPVerification = require("../model/userOTPverification")
const {securepassword} = require("../utils/passwordHash")
const dotenv = require("dotenv")
dotenv.config({path:"./config.env"})

//send email models
let transporter = nodeMailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }
});


// Send OTP verification email
const sendOTPVerificationEmail = async ({ _id, email,userName },res) => {
    try {
        const otp = randomString.generate({
            length: 4,
            charset: 'numeric'
        })
        console.log(otp);
        // Mail options
        const mailOption = {
            from: process.env.EMAIL, // Use the correct environment variable
            to: email,
            subject: "Verify Your Email",
            html: `<p>"Hi ${userName} </p>

            <p> Thank you for using our service. Your OTP (One-Time Password) for verification is:  <b style ="font-size: 20px"> ${otp} </b> </p>
            <p>Please enter this OTP on the verification page to complete the process.  
             If you did not request this OTP, please ignore this email.</p>
            <br>
           <p> Best regards</p> `
        }    

        console.log(process.env.PASSWORD,process.env.EMAIL);
        const hasedOtp = await securepassword(otp)
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            Email:email,
            otp: hasedOtp,
           
        });
       
                // Save OTP record
        await UserOTPVerification.deleteMany({ userId: _id})
        

        await newOTPVerification.save();
  

        // Send email
         await transporter.sendMail(mailOption);
        
         console.log(value);
        res.redirect(`/otp/?userId=${_id}`)

    } catch (error){
        console.log(error.message);
      res.render("user/500")
        
    }
}

module.exports = {sendOTPVerificationEmail }


