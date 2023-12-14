const Admin = require("../model/adminModel")
const bcrypt = require("bcrypt")
const User = require("../model/userModel")
const Order = require("../model/orderModel")

const Product = require("../model/productModel")
const productCategry = require("../model/productCategory")
const Coupon = require("../model/couponModel")
const { log } = require("util")
const Banner = require("../model/banner")

//ADMIN LOGIN
const loadAaminLogin = async (req, res) => {
    try {

        res.render("admin/adminLogin")
    }
    catch {
        res.render("admin/500")
    }
}




const adminlogin = async (req, res) => {
    try {
        const { password, name } = req.body;
        console.log(req.body);

        // Find admin by username
        const admin = await Admin.findOne({ name });

        if (!admin) {
            // Admin not found, render login page with an error message
            return res.render("admin/adminLogin", { message: "Admin not found" });
        }

        // Compare the provided password with the stored hashed password
        const isAdmin = await bcrypt.compare(password, admin.password);

        if (!isAdmin) {
            // Password incorrect, render login page with an error message
            return res.render("admin/adminLogin", { message: "Username/password incorrect" });
        } else {
            // Login successful, store admin ID in the session and redirect to dashboard
            req.session.admin = admin._id;
            return res.redirect('/admin/dashboard');
        }
    } catch(error) {
        console.log(error)
        res.render("admin/500")

    };
}



const dashboard = async (req, res) => {
    try {
        const { query } = req.query;
        if (query) {
            const users = await User.find({ name: { $regex: ".*" + query + ".*" } });
            return res.render("admin/userlist", { users });
        } else {
            const users = await User.find();
            return res.render("admin/userlist", { users })
        }


    }
    catch {
        res.render("admin/500")
    }
}

const UnblockTheUser = async (req, res) => {
    try {
        const { id } = req.query
        const userUpdated1 = await User.updateOne({ _id: id }, { $set: { is_block: false } });
        if (userUpdated1) {

            return res.redirect('/admin/userlist')
        }
    } catch {
        res.render("admin/500")
    }
}
const blockTheUser = async (req, res) => {
    try {

        const { id } = req.query
        const userUpdated = await User.updateOne({ _id: id }, { $set: { is_block: true } })
        if (userUpdated) {
            return res.redirect('/admin/userlist')
        }
    } catch {
        res.render("admin/500")
    }
}

// CATEGORY
const loadAddCategory = (req, res) => {
    try {
        res.render('admin/addCategory')
    } catch {
        res.render("admin/500")
    }
}

const addProductCategory = async (req, res) => {

    const name = req.body.name.toLowerCase()

    const exist = await productCategry.findOne({ categoryName: name })

    console.log(exist);

    try {
        
        if (!exist) {
            const category = new productCategry({
                categoryName: name,
                // SubCategoryName: req.body.SubCategoryname,
                description: req.body.description,
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            });
            console.log(category);

            await category.save();
            // console.log("Category saved successfully.");
            res.redirect("/admin/Category-management")
        } else {
            res.render('admin/addCategory', { message: "This category already exist....." })
        }

    } catch {
        res.render("admin/500")
        // Handle any specific error handling or response here
    }
}
const loadCategory = async (req, res) => {
    try {
        const Categores = await productCategry.find().sort({ _id: -1 })
        res.render("admin/productCategory", { Categores,message:"" })

    } catch {
        res.render("admin/500")
    }
}

const loadEditCategory = async (req,res)=>{
 
        try {
            const id = req.params.id
    
            const catagory = await productCategry.findOne({ _id: id })
          
    
            res.render("admin/editCatagory", { catagory })
        
        } catch {
            res.render("admin/500")
        }
    }


    const editCategory = async (req, res) => {
        console.log("018516");

        const { id,catagoryName,description} = req.body;
        console.log(req.body);


            const name = req.body.catagoryName.toLowerCase()
            const exist = await productCategry.findOne({ categoryName: name })
        try {
       
           if(!exist){
              

            

            // Assuming you have an existing product with its _id that you want to update
            const catagoryId = id; // Replace with the actual product's _id
    
            // Define the fields you want to update
            const updateFields = {
                categoryName: catagoryName,
    
                 description:description

    
            };
            console.log(updateFields);
    
            // Update only the specified fields using $set
            const updatedCatagory = await productCategry.findByIdAndUpdate(
                catagoryId,
                { $set: updateFields },
                { new: true } // To get the updated document back
            );
    
            if (req.file) {
                // Assuming the single file is stored in req.file
                updatedCatagory.image = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                };
                await updatedCatagory.save();
            }
           
            if (updatedCatagory) {
              
                return res.redirect("/admin/Category-management")
            }
        }else{
            return res.render("admin/editCatagory",{message:"This Catagory is Alraedy exist"})     
          }
    
    
        } catch(error) {
            console.log(error.message);
            res.render("admin/500")
        }
    }


    const catagoryDeactivate = async (req, res) => {
        try {
            
            const { id } = req.params
            const productsWithCategory = await Product.findOne({ category: id });
            const Categores = await productCategry.find().sort({ _id: -1 })
      
            if (productsWithCategory) {
                // Category is associated with products, handle accordingly
                return res.render("admin/productCategory", {Categores,message:"This catagory is already used for product can't Deactivate" });
            }

            const change = await productCategry.updateOne({ _id: id }, { $set: { isBlock: true } })
    
            if (change) {
    
                return res.redirect("/admin/Category-management")
            }
        } catch {
            res.render("admin/500")
        }
    }
    const catagoryActivate = async (req, res) => {
        try {
            const id = req.params.id
            const change = await productCategry.updateOne({ _id: id }, { $set: { isBlock: false } })
            if (change) {
                return res.redirect("/admin/Category-management")
            }
        } catch {
            res.render("admin/500")
        }
    }



// PRODUCT 
const loadProductCreate = async (req, res) => {
    try {
        const Categories = await productCategry.find()

        res.render("admin/addProduct", {message:"",Categories})
    } catch {
        res.render("admin/500")
    }
}
//add a product details into database
const createProduct = async (req, res) => {
    console.log("Product added successfully.");
    const { productName, brandName, price,offer, description, stock, category, images, color } = req.body;
    try {
         const saveCatagory = await productCategry.findOne({categoryName:category})



        const product = new Product({
            product_name: productName,

            brand_name: brandName,

            price: price,
            offer:offer,
            stock: stock,
            description: description,
            category: saveCatagory._id,
            color: color,

        });
        console.log(req.files);
        // Assuming req.files is an array of uploaded image files
        req.files.forEach(file => {
            product.images.push({ data: file.buffer, contentType: file.mimetype });
        });
        await product.save();


        if (product) {
            console.log("Product added successfully.");
            return res.redirect("/admin/productist")
        }

    } catch(error){
        console.log(error.message);
        res.render("admin/500")

    }
};
const loadProductPage = async (req, res) => {
    try {
        const products = await Product.find().populate("category")
        if (products) {
            return res.render('admin/productList', { products })
        } else {
            console.log("products not get");
        }
    } catch {
        res.render("admin/500")
    }
}
const loadProductEditPage = async (req, res) => {
    try {
        const id = req.params.id

        const product = await Product.findOne({ _id: id }).populate("category")
        const Categories = await productCategry.find({ categoryName: { $ne: product.category.categoryName} })

        res.render("admin/editProduct", { message: "", product, id, Categories })



    } catch(error) {
        console.log(error.message);
        res.render("admin/500")
    }
}
const editProduct = async (req, res) => {
    console.log("5465");

    const { productName, brandName, price,offer, description, stock, category, color, id } = req.body;
    console.log(req.body);
    
    const saveCatagory = await productCategry.findOne({categoryName:category})
    try {
        // Assuming you have an existing product with its _id that you want to update
        const productId = id; // Replace with the actual product's _id

        // Define the fields you want to update
        const updateFields = {
            product_name: productName,

            brand_name: brandName,

            price: price,
            offer:offer,
            stock: stock,
            description: description,
            category: saveCatagory._id,
            

            color: color,

        };
        console.log(updateFields);

        // Update only the specified fields using $set
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateFields },
            { new: true } // To get the updated document back
        );

        if (req.files) {
            req.files.forEach((file) => {
                updatedProduct.images.push({ data: file.buffer, contentType: file.mimetype });
            });
            await updatedProduct.save();
        }



        // const deleteprodct = await Product.deleteOne({ _id: id });
        if (updatedProduct) {
            console.log("Product edited successfully.");
            return res.redirect("/admin/productlist")
        }


    } catch(error) {
        console.log(error.message);
        res.render("admin/500")
    }
}
const productDeactivate = async (req, res) => {
    try {

        const { id } = req.params
       
        

        const change = await Product.updateOne({ _id: id }, { $set: { is_delete: true } })

        if (change) {

            return res.redirect('/admin/productlist')
        }
    } catch {
        res.render("admin/500")
    }
}
const productActivate = async (req, res) => {
    try {
        const id = req.params.id
        const change = await Product.updateOne({ _id: id }, { $set: { is_delete: false } })
        if (change) {
            return res.redirect('/admin/productlist')
        }
    } catch {
        res.render("admin/500")
    }
}

const deleteImgDelete = async (req, res) => {
    const id = req.params.id
    const imageId = req.params.imageId
    console.log(id + "XXXX" + imageId);
    try {
        console.log("HADHI---------------------------------------------------------------------------- HASSAN")
        const deleteimg = await Product.findByIdAndUpdate(
            { _id: id },
            { $pull: { "images": { _id: imageId } } },
            { new: true }
        );

        // 650c7fbf086081c38a
        if (deleteimg) {

            // console.log(deleteimg)
            return res.redirect(`/admin/productlist/${req.params.id}/Edit`)
        }
    } catch {
        res.render("admin/500")
    }
}
const orderManagment = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('deliveryAddress')
            .populate('customer')
            .populate('products.product')
            .sort({ orderDate: -1 })
            .exec();

   if(!orders){
      return res.render("admin/orderManagment", { message:"No orders", order: orders  })
   }


        res.render("admin/orderManagment", { order: orders,message:"" });
    } catch {
        res.render("admin/500")

    }
}
const updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const newStatus = req.params.statusid;
        const currentDate = new Date();
        const order = await Order.findByIdAndUpdate(orderId, { $set: { status: newStatus, deliveredAt: 0, } }, { new: true })
        const user = await User.findById(order.customer)
        if (newStatus === 'Cancelled' && order.paymentMethod === "razorPay") {
            console.log("1");
            // Refund the amount to the wallet
            const refundAmount = order.totalPrice;

            user.wallet = user.wallet + refundAmount;


            // Update wallet history
            user.walletHistory.push({
                date: new Date(),
                amount: refundAmount,
                message: `Order #${orderId} canceled: by Admin`
            });


            // Save the updated order
            const value = await user.save();
            console.log(value);
        }
        // Update status and set delivery date if the new status is 'Delivered'
        if (newStatus === 'Delivered') {
            await Order.findByIdAndUpdate(orderId, {
                $set: {
                    deliveredAt: currentDate, // Set deliveredAt field to the current date and time
                }
            }, { new: true });
        }


        // Update status and set delivery date if the new status is 'Delivered'


        return res.status(200).json({ status: order.status });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const loadCoupon = async (req, res) => {

    try {
        const allCoupon = await Coupon.find()
        res.render("admin/coupon", { allCoupon })
    } catch (error) {
        console.log(error.message);
        res.render("user/500")
    }
}

const addCoupon = async (req, res) => {
    try {
        res.render("admin/addCoupon")

    } catch (error) {
        console.log(eror.message);
        res.render("user/500")
    }

}

const couponManagement = async (req, res) => {
    console.log(req.body);
    const { couponName, type, MinimumpurchaseAmount, amountOrPercentage, Description } = req.body;
    try {

        function generateCouponCode() {
            const length = 6;
            const characters = '0123456789';
            let couponCode = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                couponCode += characters.charAt(randomIndex);
            }

            return couponCode;
        }
        const code = generateCouponCode();
        const CouponCode = new Coupon({
            coupon_name: couponName,
            description: Description,
            discount_type: type,
            minimumPurchaseAmount: MinimumpurchaseAmount,
            discount_amount_or_percentage: amountOrPercentage,
            code: code, // Assign the generated code to the 'code' property
        });

        if (CouponCode) {
            await CouponCode.save();
            console.log("coupon saved");
            return res.redirect("/admin/coupon");
        } else {
            console.log("not working");
        }

        return res.render("admin/addCoupon", { message: "Please fill in all fields...." });




    } catch (error) {
        console.log(error.message);
        res.render("user/500")
    }
}

//COUPON SOFT DELETE 
const deleteCoupon = async (req, res) => {
    const id = req.params.id
    try {
         await Coupon.findByIdAndUpdate(id, { $set: { coupon_done: true } })
        return res.redirect("/admin/coupon")
    } catch (error) {
        console.log(error.message);
    }
}

const activeCoupon = async (req, res) => {
    const id = req.params.id
    try {
        const ActiveCoupon = await Coupon.findByIdAndUpdate(id, { $set: { coupon_done: false } })
        return res.redirect("/admin/coupon",{ActiveCoupon})
    } catch (error) {
        console.log(error.message);
    }
}

const loadCouponEdit = async (req, res) => {
    try {
        const couponId = req.params.id
        const findCoupon = await Coupon.findById(couponId)
        if (findCoupon) {
            res.render("admin/editCoupon", { findCoupon })

        }
    } catch (error) {
        console.log(error.message)
    }
}

const addEditCoupon = async (req, res) => {
    try {
        const updateData = req.body;
        const findCouponUpdate = await Coupon.findById(req.body.id);

        if (!findCouponUpdate) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        console.log(req.body);
        findCouponUpdate.coupon_name = updateData.couponName;
        findCouponUpdate.minimumPurchaseAmount = updateData.MinimumpurchaseAmount;
        findCouponUpdate.discount_amount_or_percentage = updateData.amountOrPercentage;
        findCouponUpdate.description = updateData.Description;



        const updatedCoupon = await findCouponUpdate.save();
        if (updatedCoupon) {
            console.log(updatedCoupon);
            return res.redirect("/admin/coupon");
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'An error occurred while updating the coupon.' });
    }
};
const loadSales = async (req, res) => {
    try {
        let data = 0
        let deliveredOrders
        let canceledOrders
        let returnedOrder
        let totalRevenue
        let starting
        let ending
        res.render("admin/salesReport", { ending, starting, totalRevenue, returnedOrder, canceledOrders, deliveredOrders, data })
    } catch {
        res.render("admin/500")
    }
}

const calculateReport = async (req, res) => {
    try {
        const { starting, ending } = req.body;
        console.log(starting, ending)
        const startDate = new Date(starting);
        // startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(ending);
        endDate.setDate(endDate.getDate() + 1);
        // endDate.setUTCHours(23, 59, 59, 999);
        req.session.startDate = startDate;
        req.session.endingDate = endDate;
        console.log(startDate);
        console.log(endDate);

        // Successfully delivered orders
        const desiredStatuses = ['Delivered', 'Returned', 'Cancelled'];

        const deliveredOrders = await Order.find({
            orderDate: { $gte: startDate, $lte: endDate },
            status: { $in: desiredStatuses }
        })
            .populate("customer")
            .populate("products.product")
            .populate('deliveryAddress')

        const returnedOrders = await Order.find({
            orderDate: { $gte: startDate, $lte: endDate },
            status: "Returned"
        })
        const canceledOrders = await Order.find({
            orderDate: { $gte: startDate, $lte: endDate },
            status: "Cancelled"
        })


        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lte: endDate },
                    status: 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        // Here, you have the results for each type of order and total revenue
        let data = 1;
        console.log(totalRevenue);

        return res.render("admin/salesReport", {
            deliveredOrders,
            canceledOrders,
            returnedOrders,
            totalRevenue,
            data,
            starting,
            ending,
        });
    } catch (error) {
        console.error('Error:', error);
        res.render("admin/500");
    }
};


const banner  = async(req,res)=>{
    try{
        res.render("admin/banner")
    }
    catch{
        res.render("admin/500")
    }
}
const createBannner = async(req,res)=>{
    try{
    const banner = new Banner({
        title: req.body.name,
        subTitle:req.body.subTitle,
        description: req.body.description,
        image: {
            data: req.file.buffer,
            contentType: req.file.mimetype
        }
    });
  

    await banner.save();
    // console.log("Category saved successfully.");
    res.redirect("/admin/bannerlist")
} catch{
    res.render("admin/500")
}
}

const loadBanner = async(req,res)=>{
    const banner = await Banner.find()
    try{
        res.render("admin/bannerlist",{banner})
    }catch{
        res.render("admin/500")
    }
}
const bannerDeactivate = async (req, res) => {
    try {

        const { id } = req.params
       
        

        const change = await Product.updateOne({ _id: id }, { $set: { isBlock: true } })

        if (change) {

            return res.redirect('/admin/bannerlist')
        }
    } catch {
        res.render("admin/500")
    }
}
const bannerActivate = async (req, res) => {
    try {
        const id = req.params.id
        const change = await Banner.updateOne({ _id: id }, { $set: { isBlock: false } })
        if (change) {
            return res.redirect('/admin/bannerlist')
        }
    } catch {
        res.render("admin/500")
    }
}


const loadEditBanner = async (req,res)=>{
 
    try {
        const id = req.params.id

        const banner = await Banner.findOne({ _id: id })
      

        res.render("admin/editBanner", { banner })
    
    } catch {
        res.render("admin/500")
    }
}


const editBanner = async (req, res) => {
    console.log("018516");

    const { id,name,subTitle,description} = req.body;
    console.log(req.body);


  
    try {
        const bannerId = id; // Replace with the actual product's _id

        // Define the fields you want to update
        const updateFields = {
            title: name,
            subTitle:subTitle,

            
            description: description,
       

        

        };
        console.log(updateFields);

        // Update only the specified fields using $set
        const updatedBanner = await Banner.findByIdAndUpdate(
            bannerId,
            { $set: updateFields },
            { new: true } // To get the updated document back
        );

        if (req.file) {
            // Assuming the single file is stored in req.file
            updatedBanner.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
            await updatedBanner.save();
        }



        // const deleteprodct = await Product.deleteOne({ _id: id });
        if (updatedBanner) {
            console.log("Product edited successfully.");
            return res.redirect("/admin/bannerlist")
        }


    } catch(error) {
        console.log(error.message);
        res.render("admin/500")
    }
}
   
     
          

        

     



module.exports = { loadAaminLogin,bannerDeactivate,editBanner,loadEditBanner,bannerActivate,loadBanner,banner,createBannner,editCategory,loadEditCategory,catagoryActivate, calculateReport, loadSales, deleteCoupon, loadCouponEdit, activeCoupon, loadCoupon, addCoupon, couponManagement, adminlogin, dashboard, blockTheUser, UnblockTheUser, addProductCategory, loadCategory, loadAddCategory, catagoryDeactivate, loadProductCreate, createProduct, loadProductPage, loadProductEditPage, editProduct, productDeactivate, productActivate, deleteImgDelete, orderManagment, updateStatus, addEditCoupon }
