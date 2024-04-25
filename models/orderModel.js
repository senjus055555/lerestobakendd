import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: true
    },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Restaurant'
    },
    menu_items: [{
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurant.menu_items'
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      item_name: {
        type: String,
        required: true
      },
      item_price: {
        type: Number,
        required: true
      },
      price: {
        type: String
      }
    }],
    total_price: {
      type: Number,
      required: true
    },
    table_number: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Delivered', 'Completed', 'Prepared'],
      default: 'Pending'
    },
    tips: {
      type: Number,
      default: 0
    },
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cook'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }
)

const Order = mongoose.model('Order', orderSchema)

export default Order