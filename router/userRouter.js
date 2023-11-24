const express = require("express")
const router = express.Router()
const multer = require("multer")
const { isLogedout, isLogged, logouting } = require("../middleware/Auth")
const { loadHome,otpLoad,resendOTP, userSign, userRegister, userRegisterSave, userValid, verifyOTP, loadShop, loadDetails, forgotPassword, conformation, resetPassword, passwordSubmit,loadContact } = require("../controller/userController")
const { loadCart, addCart, updateCart, deleteCart } = require("../controller/cartController")
const { loadProfile,returnOrder,loadWallet ,myCoupons,profilePhoto, addAddress, loadAddress, editProfile, updateEdit,deleteAddress, orderHistory,cancelOrder } = require("../controller/profileController")
const { loadCheckOut, placeOrder,orderStatus,razorPay,addingCoupon,loadInvoice } = require("../controller/chechOutController")


const {imageCrop}= require("../middleware/crop")


const storage = multer.memoryStorage()
const upload = multer({ storage: storage });


router.get("/", loadHome)

router.get("/login", isLogged, userSign)
      .post("/login", isLogged, userValid)

router.get("/register", isLogged, userRegister)
      .post("/register", isLogged, userRegisterSave)

router.get("/logout", logouting)

router.get("/otp",isLogged,otpLoad)
      .post("/otp", isLogged, verifyOTP)

router.get("/resendOTP/:id",isLogged,resendOTP) 

router.get("/forgotpassword", isLogged, forgotPassword)
      .post("/forgotpassword", isLogged, conformation)

router.get("/repassword", isLogged, resetPassword)
      .post("/repassword", isLogged, passwordSubmit)



router.get("/shop/:page", loadShop)

router.get("/shopdetails/:id/details", loadDetails)

router.get("/cart", isLogedout, loadCart)

router.post("/cart/:id/passdata", isLogedout, addCart)

router.post("/update-cart/:id", isLogedout, updateCart);

router.post("/deletecart/:id", isLogedout, deleteCart)

router.get("/profile", isLogedout, loadProfile)
      .post("/profile",isLogedout,upload.single('image'),imageCrop,profilePhoto)

router.get("/addaddress", isLogedout, loadAddress)
      .post("/addaddress", isLogedout, addAddress)

router.get("/editaddress/:id", isLogedout, editProfile)

router.delete("/deleteAddress/:id",isLogedout,deleteAddress)

router.post("/editaddress", isLogedout,updateEdit)

router.get("/checkout", isLogedout, loadCheckOut)

router.get("/myOrder/:page",isLogedout,orderHistory)

router.post("/createPayment",isLogedout,razorPay)

router.post("/cancelOrder/:id",isLogedout,cancelOrder)

router.post("/checkOut/:currentAddress/:paymentMethod/placeOrder", isLogedout, placeOrder)

router.get ("/orderStatus/:id",isLogedout,orderStatus)

router.get("/coupons",isLogedout,myCoupons)

router.post("/applyCoupon",isLogedout,addingCoupon)

router.get("/wallet",isLogedout,loadWallet)

router.post("/returnOrder/:id",isLogedout,returnOrder)

router.get("/invoice/:id",isLogedout,loadInvoice)

router.get("/contact",loadContact)




module.exports = router
