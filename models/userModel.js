import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    // phone_number: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    isAdmin: {
        type: Boolean,
        default: false
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    }],
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    created_at: {
      type: Date,
      default: Date.now
    }
  });

  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
  }

  // userSchema.pre('save', async function (next) {
  //   // if (!this.isModified('password')) {
  //   //   next()
  //   // }
  
  //   const salt = await bcrypt.genSalt(10)
  //   this.password = await bcrypt.hash(this.password, salt)
  // })

  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
  
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      return next();
    } catch (error) {
      return next(error);
    }
  });
  
  const User = mongoose.model('User', userSchema);

  export default User