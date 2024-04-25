import asyncHandler from 'express-async-handler'
import Tip from '../models/tipModel.js'
import Order from '../models/orderModel.js';
import Cook from '../models/cookModel.js'

const tipCook = asyncHandler(async (req, res) => {
    try {
      const orderId = req.params.id;
      const { amount } = req.body;
      const userId = req.user._id;

      console.log(userId)
  
      //get the order
      const order = await Order.findById(orderId)
      order.tips = amount
      console.log(order)
      if(!order) {
        return res.status(400).json({
          message: "order not found"
        })
      }
  
      //create the tip
      const tip = new Tip({
        order: order._id,
        amount,
        user: userId
      });

      console.log('checking!!!!')
      console.log(tip)
  
      //add the tip to the order and save the order
    //   order.tips.push(tip);
    //   await order.save();
  
      //add the tip amount to the cook's total tip amount
    //   order.cook.tip_amount += amount;
    //   await order.cook.save();
    const cook = await Cook.findOne({orders: orderId})
    cook.totalTip = cook.totalTip + amount

    await cook.save()
    await tip.save()
    await order.save()
      res.status(200).json({
        message: `You tipped  ${amount}! Thank you for your generosity!`
      })
    } catch(error) {
      console.log(error)
      res.status(500).json({
        message: "Server error"
      })
    }
  })

  export {
    tipCook
  }