const Address = require("../model/userProfileModel")
const Razorpay = require("razorpay")
const User = require("../model/userModel")
const Order = require("../model/orderModel")
const { v4: uuidv4 } = require('uuid');
const Product = require("../model/productModel")
require("dotenv").config();
const Coupon = require("../model/couponModel")



const razorPay = async (req, res) => {
    try {

        const { couponCode } = req.body
        console.log(couponCode);
        const user = await User.findById(req.session.user)
        const code = await Coupon.findById(couponCode)
        if (couponCode) {
           
            user.discountAmount = code.discount_amount_or_percentage;
        }else{
            user.discountAmount = 0
        }
          


        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret: process.env.RAZORPAY_SECRET_KEY
        });
     

        var options = {
            amount: (user.grandTotal - user.discountAmount) * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        instance.orders.create(options, function (err, order) {
            console.log(err);

            res.send({ orderId: order.id });
        });
    } catch (error) {
        res.render("user/500")

    }





}
const loadCheckOut = async (req, res) => {
    const address = await Address.find({ userId: req.session.user })
    const user = await User.findById(req.session.user).populate("cart.product")
    
    try {

        if (user.cart.length === 0) {
            res.render("user/checkOut", {user, message: "pls add your cart items", grandTotal: 0, cart: user.cart })
        }
        else if (!address) {
            res.render("user/checkOut", {user,products: user.cart, message: "pls add your address" })
        }

        else {
            res.render("user/checkOut", {user, address, products: user.cart, })
        }
    } catch {
        res.render("user/500")

    }
}
const placeOrder = async (req, res) => {
    try {

        const { currentAddress, paymentMethod } = req.params
      
        const { couponCode } = req.body
       
        const user = await User.findById(req.session.user).populate("cart.product")
        if (couponCode) {
            const code = await Coupon.findByIdAndUpdate({ _id: couponCode }, { $addToSet: { user: req.session.user } });
            user.discountAmount = code.discount_amount_or_percentage;
        }else{
            user.discountAmount = 0
        }



   


        const orderId = uuidv4();
        const order = new Order({
            orderId: orderId,
            customer: req.session.user,
            products: user.cart,
            totalPrice: user.grandTotal - user.discountAmount,
            discountAmount:user.discountAmount,
            deliveryAddress: currentAddress,
            paymentMethod: paymentMethod,
            grandTotal:user.grandTotal
         




        })
         


        await order.save()
        user.cart.forEach(async (item) => {
            const foundProduct = await Product.findById(item.product._id);
          
            foundProduct.stock -= item.quantity;
          
            await foundProduct.save();
          });
        if (paymentMethod === "razorPay") {
            await Order.updateOne(
                { _id: order._id }, // Assuming _id is the unique identifier of the newly created order
                { $set: { paymentStatus: "Done" } }
            );
        }


        await User.findByIdAndUpdate(req.session.user, { $set: { cart: [], grandTotal: 0, code: null } })
        res.status(200).json({ placeId: order.orderId })



    } catch (error) {
        console.log(error);
        res.render("user/500")
    }

}
const orderStatus = async (req, res) => {
    const orderId = req.params.id

    const order = await Order.findOne({ orderId }).populate("products.product")

    const user = await User.findById(req.session.user).populate("cart.product")

    try {
        if (!order) {
            res.render("user/checkOut", { message: "pls place your order " })
        }
        else {

            res.render("user/orderStatus", { order, user })
        }


    } catch {
        res.render("user/500")
    }
}


const addingCoupon = async (req, res) => {
    const code = req.body.couponCode
   
    try {
        const findCode = await Coupon.findOne({ code });
        
        const user = await User.findById(req.session.user);

        if (!findCode) {
            return res.json({ error: "Coupon not found, please try again..." });
        }


        const hasUsedCoupon = findCode.user.includes(req.session.user);

        if (!hasUsedCoupon) {
            // User hasn't used the coupon before, apply it
            const currentDate = new Date();
            if (findCode.expaire_date < currentDate) {
                return res.json({ error: "This coupon has expired..." });
                
            }
   

            if (user.grandTotal > findCode.minimumPurchaseAmount) {
                if (findCode.discount_type === "Percentage") {
                    const discountAmount = Math.floor((findCode.discount_amount_or_percentage / 100) * user.grandTotal);
                    const newAmount = Math.floor(user.grandTotal - discountAmount);
                    await User.updateOne({ _id: req.session.user }, { $set: { code: findCode.code } });

                    // Add the user to the coupon's used users array

                    
                    return res.json({ newAmount, discountAmount, id: findCode._id });

                } else {
                    const discountAmount = findCode.discount_amount_or_percentage;
                    const newAmount = Math.floor(user.grandTotal - discountAmount);
                    await User.updateOne({ _id: req.session.user }, { $set: { code: findCode.code } });
                    console.log("55555");
                    // Add the user to the coupon's used users array



                    return res.json({ newAmount, discountAmount, id: findCode._id });
                }
            } else {
                return res.json({ error: "The coupon is valid for purchases above 5000 rupees.." });
            }
        } else {
    console.log("33333");

            return res.json({ error: "Sorry, you have already used this coupon code..." });
        }
    } catch (error) {
        res.render("user/500", { message: "An error occurred. Please try again later." });
    }
};

const loadInvoice = async(req,res)=>{
    const id = req.params.id 
    const order = await Order.findById(id).populate("products.product")
    .populate('deliveryAddress').exec()
    const user = await User.findById(req.session.user)
    console.log(user);
    try{
        res.render("user/invoice",{order,user})
    }
    catch(err){
        res.render("user/500")
        console.log(err.message);
}
}






module.exports = { loadCheckOut, placeOrder, orderStatus, razorPay, addingCoupon,loadInvoice }