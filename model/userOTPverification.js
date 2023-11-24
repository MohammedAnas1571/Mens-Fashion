const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserOTPVerificationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    Email: {
        type: String,
        required: true,
    },
    otp: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date,
        default: function() {
            // Set expireAt to 5 minutes after createdAt
            return new Date(this.createdAt.getTime() + 5 * 60 * 1000);
        }
    }
});

// Middleware to update expireAt before saving the document
UserOTPVerificationSchema.pre('save', function(next) {
    // Update expireAt to 5 minutes after createdAt
    this.expireAt = new Date(this.createdAt.getTime() + 5 * 60 * 1000);
    next();
});

const 
UserOTPVerification = mongoose.model('UserOTPVerification', UserOTPVerificationSchema);

module.exports = UserOTPVerification;
