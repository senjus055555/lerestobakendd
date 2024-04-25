import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const cookSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    specialty: [{
      type: String,
      required: true
    }],
    experience: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    totalTip: {
      type: Number,
      default: 0
    },
    created_at: {
      type: Date,
      default: Date.now
    }
});

cookSchema.methods.matchPassword = async function (enteredPassword) {
  if(this.password === enteredPassword) {
    return true
  } else {
    return false
  }
}

// cookSchema.pre('create', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.get('password'), salt);
//     this.set('password', hashedPassword);
//     return next();
//   } catch (error) {
//     return next(error);
//   }
// });
  
const Cook = mongoose.model('Cook', cookSchema);

export default Cook