import mongoose from "mongoose";

const tipSchema = new mongoose.Schema({
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  });
  
const Tip = mongoose.model('Tip', tipSchema);

export default Tip