const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
    {
      orderId: {
        type: String,
        unique: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          totalAmount: Number,
        },
      ],
      orderDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending',
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
      },
      paymentMethod: {
        type: String,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Done'],
        default: 'Pending',
      },
      cancelReason: {
        type: String,
      },
      returnReason: {
        type: String,
      },
      deliveredAt: {
        type: Date,
      },
      discountAmount: {
        type: Number,
      },
      grandTotal:{
        type:Number
      }
    }
    

  );
  
  const Order = mongoose.model('Order', orderSchema);
  
  module.exports = Order;
  