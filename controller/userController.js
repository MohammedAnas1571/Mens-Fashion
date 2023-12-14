const User = require("../model/userModel")

const { sendOTPVerificationEmail } = require("../utils/email")
const { securepassword } = require("../utils/passwordHash")
const bcrypt = require("bcrypt")
const userOTPVerification = require("../model/userOTPverification")
const Product = require("../model/productModel")
const Catagory = require("../model/productCategory")
const Banner = require("../model/banner")
const { log } = require("util")
const { ObjectId } = require("mongodb")






const loadHome = async (req, res) => {

 
    try {
        const products = await Product.find({ is_delete: false }).sort({ _id: -1 });
        const user = await User.findById(req.session.user)
        const banner = await Banner.find({isBlock:false})
        res.render("user/home",{products,user,banner});
    } catch {
        res.render("user/500")
    }
};

const userSign = async (req, res) => {
    try {
        res.render("user/login");
    } catch {
        res.render("user/500")
    }
};


const userRegister = async (req, res) => {
    try {
        res.render("user/register")

    } catch {
        res.render("user/500")
    }
}

const forgotPassword = async (req, res) => {
    try {
        res.render("user/forgotPassword")
    } catch {
        res.render("user/500")
    }
}
const conformation = async (req, res) => {
    try {
        const { email } = req.body
        console.log(email);
        const confirm = await User.findOne({ email })
        console.log(confirm);
        if (!confirm) {
            res.render("user/forgotPassword", { mesaage: "Email is not found" })
        } else {
            sendOTPVerificationEmail(confirm, res)


        }
    } catch {
        res.render("user/500")
    }
}

const resetPassword = async (req, res) => {
    try {
        res.render("user/resetPassword")
    } catch {
        res.render("user/500")
    }
}

const passwordSubmit = async (req, res) => {
    try {
        const { id, password } = req.body
        console.log(id, password)

        const newPassword = await securepassword(password, 10)
        console.log(newPassword);

        const isMatch = await User.findByIdAndUpdate(id, { $set: { password: newPassword } })
        console.log(isMatch);
        if (isMatch) {
            res.redirect("/login")
        } else {
            res.render("/repassword", { message: "error pls enter password again" })
        }

    } catch {
        res.render("user/500");
    }
}
const otpLoad = async (req, res) => {
    const { userId } = req.query
    try {
        res.render("user/otp", { userId, n: 300 })
    } catch {
        res.render("user/500")
    }
}
const resendOTP = async (req, res) => {

    const user = await User.findById(req.params.id)
    try {
        sendOTPVerificationEmail(user, res)
    } catch {
        res.render("user/500")
    }
}



const userRegisterSave = async (req, res) => {
    const { userName, email, mobile, password } = req.body
    console.log(req.body);

    try {
        const userFind = await User.findOne({ email })
        if (userFind) {
            res.render("user/register", { message: "Email Already exist" })
        }



        const newvalue = await securepassword(password)

        const user = new User({
            userName,
            email,
            mobile,
            password: newvalue,


        })
        const userData = await user.save()


        if (userData) {

            sendOTPVerificationEmail(userData, res)

        }


        else {
            res.render("user/register", { message: "your registration has been failed." })

        }
    } catch (error){
        console.log(error.message);
        res.render("user/500")
    }

}

const userValid = async (req, res) => {


    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        console.log(user);
        if (!user) {
            return res.render("user/login", { message: " user not found pls register " })
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        console.log(isMatch);
        if (!isMatch) {

            return res.render("user/login", { message: "username/password is incorrect" })
        }

        if (user.is_block == true) {
            return res.render("user/login", { message: "Your account is blocked by admin " })
        }
        console.log(user.is_verified);
        if(user.is_verified ==  false){
          
            return res.render('user/login',{message:"Please verify your Otp!"})
        }

        req.session.user = user._id;
        res.redirect("/")
    } catch {
        res.render("user/500")
    }
}


const verifyOTP = async (req, res) => {

    const { otp, userId } = req.body

    try {
        const userotp = await userOTPVerification.findOne({ userId });
        const user = await User.findById(userId)
        console.log(userotp);

        const isMatch = await bcrypt.compare(otp, userotp.otp)
        console.log(isMatch);
        if (userotp.expireAt < Date.now()) {

            res.render("user/otp", { userId, message: "OTP expired pls click resend OTP", n: 0 })
        } else {
            console.log("hai");
            if (user.is_verified && isMatch) {
                return res.render("user/resetPassword", { userId: userId, })

            } else if (isMatch) {
                await User.findByIdAndUpdate(userId, { $set: { is_verified: true } })
                return res.redirect("/login")

            } else {
                return res.render("user/otp", { userId, message: "invalid otp", n: 300 })

            }
        }

    } catch {
        res.render("user/500")
    }
}
const loadShop = async (req, res) => {
    console.log(req.query.query);
    const user = await User.findById(req.session.user)
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 6;
        const skip = (page - 1) * pageSize;

        let products;
        const catagory = await Catagory.find();

        if (req.query.query) {
            products = await Product.find({
                product_name: { $regex: ".*" + req.query.query + ".*", $options: "i" },
                is_delete: false
            }).skip(skip).limit(pageSize);
            
        } else {
            products = await Product.find({ is_delete: false }).skip(skip).limit(pageSize);
        }

        // Calculate total pages for pagination
        const totalProducts = await Product.countDocuments({ is_delete: false });
        const totalPages = Math.ceil(totalProducts / pageSize);
        console.log(totalProducts);

        res.render("user/shop", {
            catagory,
            products,
            currentPage: page,
            totalPages: totalPages,
            user
        });
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        res.render("user/500");
    }
};
const loadSearch = async (req, res) => {
    console.log(req.params.id);
    const user = await User.findById(req.session.user)
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 6;
        const skip = (page - 1) * pageSize;

        let products;
        const catagory = await Catagory.find();
    
   console.log("234986");
   if(req.params.id){
  
   products = await Product.find({ category: req.params.id ,is_delete:false}).skip(skip).limit(pageSize);
   console.log("Products:", products);
   }
     
        // Calculate total pages for pagination
        const totalProducts = await Product.countDocuments({ is_delete: false });
        const totalPages = Math.ceil(totalProducts / pageSize);
        console.log(totalProducts);

        res.json( {
            catagory,
            products,
            currentPage: page,
            totalPages: totalPages,
            user
        });
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        res.render("user/500");
    }
};

const loadBrand = async (req, res) => {
    console.log(req.params.name);
    const user = await User.findById(req.session.user)
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 6;
        const skip = (page - 1) * pageSize;

        let products;
        const catagory = await Catagory.find();
    
   console.log("234986");
   if(req.params.name){
  
   products = await Product.find({ brand_name: req.params.name ,is_delete:false}).skip(skip).limit(pageSize);
   console.log("Products:", products);
   }
     
        // Calculate total pages for pagination
        const totalProducts = await Product.countDocuments({ is_delete: false });
        const totalPages = Math.ceil(totalProducts / pageSize);
        console.log(totalProducts);

        res.json( {
            catagory,
            products,
            currentPage: page,
            totalPages: totalPages,
            user
        });
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        res.render("user/500");
    }
};



const loadDetails = async (req, res) => {

    const { id } = req.params
    const user = await User.findById(req.session.user)

    const product = await Product.findById(id)
    console.log(product)


    try {
        res.render("user/shopDetails", { product,user})
    } catch {
        res.render("user/500")
    }
}

const loadContact = async (req, res) => {
    try {
      const user = await User.findById(req.session.user);
      res.render("user/contact", { user }); // Pass user as an object
    } catch {
      res.render("user/500");
    }
  };


module.exports = { loadHome,loadContact,loadSearch,loadBrand, otpLoad, userSign, userRegister, userRegisterSave, userValid, verifyOTP, loadShop, loadDetails, forgotPassword, conformation, resetPassword, passwordSubmit, resendOTP };
