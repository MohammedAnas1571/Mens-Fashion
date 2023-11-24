
const User = require("../model/userModel")
const Product = require("../model/productModel")



const loadCart = async (req, res) => {
    const user = await User.findById(req.session.user).populate("cart.product")
    console.log('Cart...'+ user.cart);
    try {
        if (user.cart.length === 0) {
            res.render("user/cart", {user, cart: user.cart, grandTotal: user.grandTotal ,message: " Cart is empty please add products" });
        } else {
           
            res.render("user/cart", {user, cart: user.cart, grandTotal: user.grandTotal }); // Corrected line

        }
    } catch    {
        res.render("user/500")  
       
    }
}

const addCart = async (req, res) => {

    try {

        const id = req.params.id
        console.log(id);
        console.log("2681");
        const userId = req.session.user
        const quantity = 1

        const product = await Product.findById(id)
        
        const user = await User.findById(userId).populate('cart.product');
      
        
         console.log("116546");
        let totalAmount = product.price * quantity;
        if(product.offer){
            totalAmount = totalAmount - (totalAmount * product.offer) / 100
        }
        const exist = user.cart.find(c => c.product._id.toString() == id)
        if (exist) {
            exist.quantity = exist.quantity + 1
            exist.totalAmount = product.price * exist.quantity
            if(product.offer){
                exist.totalAmount = exist.totalAmount -  (exist.totalAmount * product.offer) / 100
            }
            if ((exist.quantity ) > product.stock) {
                
                return res.status(400).json({ message: "Insufficient stock." });
            } 
        } else {

            user.cart.push({ product: id, quantity, totalAmount })

        }
        let totalCartValue = 0;
        user.cart.forEach(item => {
            totalCartValue += item.totalAmount;
        });
        console.log(totalCartValue);
        user.grandTotal = totalCartValue;
        await user.save()
        res.status(200).json(user.cart.length)
    } catch (err) {
        console.log(err);
        res.render("user/500")

    }

}

const updateCart = async (req, res) => {
    try {
        const user = await User.findById(req.session.user)
        const cart = user.cart.find(c => c.product._id.toString() === req.params.id);
        if (cart) {
            const product = await Product.findById(cart.product)
            if (req.body.type === "increment") {
                if ((cart.quantity + 1) > product.stock) {
                    console.log("565846");
                    return res.status(400).json({ message: "Insufficient stock." });
                } else {
                    cart.quantity = cart.quantity + 1;
                    cart.totalAmount = product.price * cart.quantity;
                    if(product.offer){
                        cart.totalAmount = cart.totalAmount -  (cart.totalAmount * product.offer) / 100
                    }
                }
            }
            else {
                if (cart.quantity !== 1) {
                    cart.quantity--;
                    cart.totalAmount = product.price * cart.quantity;
                    if(product.offer){
                        cart.totalAmount = cart.totalAmount -  (cart.totalAmount * product.offer) / 100
                    }
                }
            }
            let insufficientStock = false;
            if (product.stock < cart.quantity) {
                insufficientStock = true
            }
            let totalCartValue = 0;
            user.cart.forEach(item => {
                totalCartValue += item.totalAmount;
            });
            user.grandTotal = totalCartValue;
           
            await user.save();

            return res.status(200).json({
                message: "Success",
                quantity: cart.quantity,
                totalPrice: cart.totalAmount,
                grandTotal: user.grandTotal,
                insufficientStock,
            });
        } else {
            return res.status(404).json({ message: "Product not found in the user's cart." });
        }
    } catch  {
        res.render("user/500")
    }
}
const deleteCart = async (req, res) => {

    try {
        const id = req.params.id
        const user = await User.findById(req.session.user)
        const exist = user.cart.findIndex(c => c.product._id.toString() == id);
        let find = user.cart.find(c => c.product._id.toString() == id);
        user.grandTotal = user.grandTotal - find.totalAmount
        console.log(user.grandTotal);
        user.cart.splice(exist, 1)
        await user.save();
        res.status(200).json({
            grandTotal:user.grandTotal,
            cartLength:user.cart.length,
             cart:user.cart.length
        })

    } catch  {
        res.render("user/500")
} 
}
module.exports = { loadCart, addCart, updateCart, deleteCart }