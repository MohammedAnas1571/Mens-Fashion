const Address = require("../model/userProfileModel")
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const { log } = require("util");
const Coupons = require("../model/couponModel")
const Product = require("../model/productModel")



const loadProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user);
    const address = await Address.find({ userId: req.session.user })
    const showAddAddressButton = address.length < 4;

    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('user/userProfile', { user, address, showAddAddressButton });
  } catch {
    res.render("user/500")

  }
}
const profilePhoto = async (req, res) => {

  const { image } = req.body

  try {
    const user = await User.findByIdAndUpdate(req.session.user, {
      $set: {
        image: {
          data: req.file.buffer, // Assuming image.buffer contains the image data
          contentType: req.file.mimetype, // Assuming image.mimeType contains the content type (e.g., 'image/jpeg')
        },
      },
    });

    const address = await Address.find({ userId: req.session.user })
    const showAddAddressButton = address.length < 4;

    res.redirect('/profile');
  } catch (error) {
    res.render("user/500");
    console.log(error.message);
  }
}


const loadAddress = async (req, res) => {
  const user = await User.findById(req.session.user);
  try {
    res.render("user/addressAdding", { user })
  } catch {
    res.render("user/500");
  }
}

const addAddress = async (req, res) => {
  const { name, email, number, adressone, adresstwo, area, postcode, district, state, country, image } = req.body;
  const exist = await Address.findOne({ email })
  const user = await User.findById(req.session.user);
  try {
    if (exist) {
      res.render("user/addressAdding", { message: "This email with address is already added", user })
    } else {
      const newAddress = new Address({
        userId: req.session.user,
        userName: name,
        email: email,
        mobile: number,
        line1: adressone,
        place: adresstwo,
        post: area,
        postcode,
        district,
        state,
        country,
      });

      await newAddress.save();
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
    return res.render("user/500")


  }
};

const editProfile = async (req, res) => {
  const user = await User.findById(req.session.user);
  const address = await Address.findById(req.params.id)

  try {
    res.render("user/editProfile", { address, user })
  } catch {
    res.render("user/500");
  }

}

const updateEdit = async (req, res) => {
  try {
    const { name, email, number, adressone, adresstwo, area, postcode, district, state, country } = req.body;

    // Update the document in the Address collection
    const updatedAddress = await Address.findById(req.body.id);
    updatedAddress.userName = name,
      updatedAddress.email = email,
      updatedAddress.mobile = number,
      updatedAddress.line1 = adressone,
      updatedAddress.place = adresstwo,
      updatedAddress.post = area,
      updatedAddress.postcode = postcode
    updatedAddress.district = district
    updatedAddress.state = state
    updatedAddress.country = country

    await updatedAddress.save()
    if (!updatedAddress) {
      return res.status(404).send('Address not found');
    }

    res.redirect("/profile");
  } catch {
    res.render("user/500")

  }
};


const deleteAddress = async (req, res) => {
  console.log(req.params.id);
  try {
    const deletedAddress = await Address.findByIdAndDelete(req.params.id);

    if (!deletedAddress) {
      // Address with the given ID was not found
      return res.status(404).json({ error: 'Address not found' });
    }

    // Address was successfully deleted
    return res.status(200).json("");
  } catch {
    res.render("user/500")

  }
}



const orderHistory = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const pageSize = 2;
  const skip = (page - 1) * pageSize;

  const order = await Order.find({ customer: req.session.user })
    .populate('deliveryAddress')
    .populate('customer')
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(pageSize)
    .exec();

  const user = await User.findById(req.session.user);

  const totalProducts = await Order.countDocuments({ customer: req.session.user });
  const totalPages = Math.ceil(totalProducts / pageSize);

  try {
    if (!order || order.length === 0) {
      return res.render("user/myorder", { order, message: "No Orders", user, currentPage: page, totalPages: totalPages });
    }
    res.render("user/myOrder", { order, user, currentPage: page, totalPages: totalPages });
  } catch (error) {
    console.log(error.message);
    res.render("user/500");
  }
};




const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);
    const user = await User.findById(req.session.user)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentMethod === 'razorPay') {
      console.log("1");
      // Refund the amount to the wallet
      const refundAmount = order.totalPrice;



      user.wallet = user.wallet + refundAmount;


      // Update wallet history
      user.walletHistory.push({
        date: new Date(),
        amount: refundAmount,
        message: `Order #${orderId} canceled: ${reason}`
      });


      // Save the updated order
       await user.save();
 
    }

    // Update order status and cancellation reason
    order.status = 'Cancelled';
    order.cancelReason = reason;


    // Assuming you have a field named "cancellationReason" in your Order schema

    // Save the updated order to the database
    await order.save();
    console.log("15659");
 
await Promise.all(
  order.products.map(async (orderProduct) => {
    console.log("315515ewfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    try {
      const foundProduct = await Product.findById(orderProduct.product._id);
      console.log(foundProduct);
      if (foundProduct) {
        foundProduct.stock += orderProduct.quantity;
        await foundProduct.save();
      }
    } catch (error) {
      console.error(`Error updating product: ${error.message}`);
    }
  })
);
    

   console.log("256486");
    res.status(200).json({ message: 'Order cancelled successfully and amount will credited to your wallet' });

  } catch {
    res.render("user/500")
  }
}
const returnOrder = async (req, res) => {
  const orderId = req.params.id;
  const { reason } = req.body;
  console.log(reason);

  try {
    const order = await Order.findById(orderId);
    const user = await User.findById(req.session.user)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const refundAmount = order.totalPrice

    // Update wallet and wallet history
    user.wallet = user.wallet + refundAmount;

    user.walletHistory.push({
      date: new Date(),
      amount: refundAmount,
      message: `Order #${orderId} returned: ${reason}`
    });

    await user.save();


    order.status = 'Returned';
    order.returnReason = reason;

    console.log(order.status);
    console.log(order.returnReason)


    // Assuming you have a field named "cancellationReason" in your Order schema

    // Save the updated order to the database
         await order.save();

         await Promise.all(
          order.products.map(async (orderProduct) => {
           
            try {
              const foundProduct = await Product.findById(orderProduct.product._id);
            
              if (foundProduct) {
                foundProduct.stock += orderProduct.quantity;
                await foundProduct.save();
              }
            } catch (error) {
              console.error(`Error updating product: ${error.message}`);
            }
          })
        );
            


    // Send a success response
    res.status(200).json({ message: 'Order returned successfully amount will credited to your wallet', });

  } catch {
    res.render("user/500")
  }
}
const myCoupons = async (req, res) => {
  try {
    const coupons = await Coupons.find();
    const user = await User.findById(req.session.user);
    const currentDate = new Date();

    const couponsWithExpiration = coupons.map(coupon => ({
      ...coupon.toObject(),
      expaire_date: coupon.expaire_date // Replace with the actual field name if different
    }));

    if (!coupons || coupons.length === 0) {
      return res.render("user/myCoupons", { coupons: [], user, currentDate, message: "No coupons available" });
    }

    res.render("user/myCoupons", { coupons: couponsWithExpiration, user, currentDate });
  } catch (error) {
    console.error(error.message);
    res.render("user/500");
  }
};


const loadWallet = async (req, res) => {
  try {
    const user = await User.findById(req.session.user)
      .sort({ "walletHistory.date": -1 });

    return res.render("user/wallet", { user });




  } catch (error) {
    res.render("user/500", { message: "An error occurred. Please try again later." });
  }
}//







module.exports = { loadProfile, returnOrder, loadWallet, profilePhoto, addAddress, loadAddress, editProfile, updateEdit, deleteAddress, orderHistory, cancelOrder, myCoupons }