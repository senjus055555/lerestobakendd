import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import colors from 'colors'
import {notFound, errorHandler} from "./middleware/errorMiddleware.js"
import  connectDB from "./config/db.js"
import asyncHandler from 'express-async-handler'

import Restaurant from './models/restaurantModel.js'
import Order from './models/orderModel.js'
import userRoutes from './routes/userRoutes.js'
import restaurentRoutes  from './routes/restaurentRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import tipRoutes from './routes/tipRoutes.js'
import stripePackage from 'stripe';

const stripe = stripePackage('sk_test_51O1MCkKoYFAYewxjwG6lWJXkhL1tlkHctvYBtwQpOO4x8xtNZww5xl1ydaOKvXLFKXT2ZVnjOHvMQeRhIoVMkIdg00jSK5BAP4');

dotenv.config()

connectDB()

// sk_test_51O1MCkKoYFAYewxjwG6lWJXkhL1tlkHctvYBtwQpOO4x8xtNZww5xl1ydaOKvXLFKXT2ZVnjOHvMQeRhIoVMkIdg00jSK5BAP4
// chicken tikka = > price_1OgJS1KoYFAYewxjuRAq2JEm

//initializing the express app
const app = express()  

app.use(cors())
app.use(express.json())   

app.use('/api/users', userRoutes)//completed
app.use('/api/restaurents', restaurentRoutes) //completed
app.use('/api/order', orderRoutes)
app.use('/api/tip', tipRoutes)

app.get('/api/temp', (req, res) => {
    res.status(200).send("api is running")
})   

app.get('/api/payment', asyncHandler(async (req, res) => {
  try {
      const restaurantId = req.query.restaurantId;
      let tableNumber = parseInt(req.query.tableNumber);

      console.log(req.query.tableNumber)

      console.log(tableNumber)

      if (isNaN(tableNumber)) {
        console.log('seems im not a number')
        tableNumber = req.query.tableNumber
      }
  
      const restaurant = await Restaurant.findById(restaurantId);
  
      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }
  
      const orders = await Order.find({ restaurant_id: restaurantId, table_number: tableNumber, status: 'Delivered' });

      // console.log(`orders: ${orders}`)
      
      if (orders.length <= 0) {
          return res.status(400).json({error: 'Awaiting cheff to mark the order as delivered'})
      }
    
      // Create an object to store the menu items and their quantities
      const menuItemsMap = new Map();
  
      // Iterate over the orders and update the menuItemsMap with the quantities
      orders.forEach(order => {
          order.menu_items.forEach(menuItem => {
              const { item_id, item_name, item_price, quantity, price } = menuItem;
  
              // If the menu item is already in the map, increase the quantity
              if (menuItemsMap.has(item_id.toString())) {
                  const existingMenuItem = menuItemsMap.get(item_id.toString());
                  existingMenuItem.quantity += quantity;
              } else {
                  // Otherwise, add the menu item to the map
                  menuItemsMap.set(item_id.toString(), {
                      item_id,
                      item_name,
                      item_price,
                      quantity,
                      price
                  });
              }
          });
      });
  
      // Convert the map values to an array
      const menuItems = Array.from(menuItemsMap.values());

      console.log(menuItems)
  
      // Map the menu items to match Stripe's expected format
      const menuItemsNew = menuItems.map(item => {
        const unitAmount = item.item_price * 100; // Convert item price to cents
        return { 
            price_data: { 
                currency: 'inr', 
                product_data: { 
                    name: item.item_name 
                }, 
                unit_amount: unitAmount 
            }, 
            quantity: item.quantity 
        };
    });
    

      // console.table(menuItemsNew);
  
      const session = await stripe.checkout.sessions.create({
          line_items: menuItemsNew,
          mode: 'payment',
          payment_method_types: ['card'],
          success_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cancel"
      });
  
      // Update the status of delivered orders to 'Completed'
      await Order.updateMany({ restaurant_id: restaurantId, table_number: tableNumber, status: 'Delivered' }, { $set: { status: 'Completed' } });
  
      res.send(JSON.stringify({
          url: session.url
      }));
  } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}));

app.use(notFound)
app.use(errorHandler)


console.log(`the port is ${process.env.PORT}`)

const port = process.env.PORT || 3001
console.log(port)

app.listen(port, console.log("app is running.."))