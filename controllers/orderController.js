import asyncHandler from 'express-async-handler'
import Restaurant from '../models/restaurantModel.js'
import Order from '../models/orderModel.js'
import Cook from '../models/cookModel.js'
import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId

const placeOrder = asyncHandler(async (req, res) => {
  const { customer_name, restaurant_id, menu_items, total_price, table_number } = req.body;
  console.log(`placing the order`)
  console.log(customer_name)
  for (let i = 0; i < menu_items.length; i++) {
    if (menu_items[i].quantity === 0) {
        menu_items.splice(i, 1);
        i--; // Decrement i to account for the removed item
    }
}

  // Retrieve the restaurant to check if the menu items exist and update the remaining quantity
  // console.log('printing the menu items')
  // console.log(menu_items)
  // console.log('printing the body object')
  // console.log(req.body)
  
  // await order.save();

  // const cook = await Cook.findOneAndUpdate(
  //   { specialty: { $in: menu_items.map(item => item.item_name) } },
  //   { $push: { orders: order._id } },
  //   { new: true }
  // );

  // console.log(cook._id.toHexString())
  // order.cook = cook._id.toHexString()

   // Update the remaining field of each menu item and assign the order to a cook
  //  for (let i = 0; i < menu_items.length; i++) {
  //   const menuItem =  restaurant.menu_items.findById(menu_items[i].item_id);
  //   menuItem.remaining -= menu_items[i].quantity;
  //   await menuItem.save();
    
  //   const cooks = await Cook.find({ specialty: menuItem.name });
  //   if (cooks.length === 0) {
  //     return res.status(400).json({ message: `No cooks available for ${menuItem.name}` });
  //   }
    
  //   const assignedCook = cooks[Math.floor(Math.random() * cooks.length)];
  //   assignedCook.orders.push(order._id);
  //   await assignedCook.save();
  // }


  try {
    // Save the updated restaurant and the new order to the database
    // await restaurant.save();

    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

  // Check if the table is already taken in current orders
  // const currentOrders = await Order.find({ status: { $ne: 'Completed' } });
  // console.log(currentOrders)
  
  // for (const order of currentOrders) {
  //   console.log(order.table_number)
  //   if (order.table_number === table_number) {
  //     return res.status(400).json({ message: `Table ${table_number} is already taken` });
  //   }
  // }

  // Create a new order with the given data
  const order = new Order({
    customer_name,
    restaurant_id,
    menu_items,
    total_price,
    table_number
  });



  // console.log('iam printing the orders')
  // console.log(order)

  // Update the remaining quantity of each menu item
  for (const item of menu_items) {
    const menuItem = restaurant.menu_items.id(item.item_id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    const remaining = menuItem.remaining - item.quantity;
    console.log('remaining qty is ', remaining)
    if (remaining < 0) {
      return res.status(400).json({ message: `${menuItem.item_name} is out of stock` });
    }
    menuItem.remaining = remaining;
  }

  await restaurant.save();

  console.log(order)

  await order.save();
    // await cook.save()
  res.status(201).send(order);
  } catch (error) {
    res.status(500).json({ message: 'Error placing order' });
  }
})

/*const updateOrder = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const { menu_items, total_price } = req.body;
    console.log(menu_items)

    //get the order
    const order = await Order.findById(orderId)
    if(!order) {
      res.status(400).json({
        message: "order not found"
      })
    }

    // Update the remaining quantity of each menu item
    for (const item of menu_items) {
      // const menuItem = order.menu_items.id(item.item_id);
      const restaurantId = order.restaurant_id
      const id = restaurantId.toHexString();
      const restaurant = await Restaurant.findById(id)
      const menuItem = restaurant.menu_items.id(item.item_id);

      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      const remaining = menuItem.remaining - item.quantity;
      if (remaining < 0) {
        return res.status(400).json({ message: `${menuItem.item_name} is out of stock` });
      }
      menuItem.remaining = remaining;
    }

    order.menu_items.push(menu_items)
    order.total_price = total_price
    order.menu_items.forEach(item => {
      item.item_id = new ObjectId(item.item_id);
    });
    const updatedOrder = await order.save()
    res.status(204).send(updatedOrder)
  } catch(error) {
    console.log(error)
    res.status(500).json({
      message: "Server error"
    })
  }
})*/

const updateOrder = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const { menu_items, total_price } = req.body;
    console.log(menu_items)

    //get the order
    const order = await Order.findById(orderId)
    if(!order) {
      res.status(400).json({
        message: "order not found"
      })
    }

    // Update the remaining quantity of each menu item
    for (const item of menu_items) {
      const restaurantId = order.restaurant_id
      const id = restaurantId.toHexString();
      const restaurant = await Restaurant.findById(id)
      const menuItem = restaurant.menu_items.id(item.item_id);

      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      const remaining = menuItem.remaining - item.quantity;
      if (remaining < 0) {
        return res.status(400).json({ message: `${menuItem.item_name} is out of stock` });
      }
      menuItem.remaining = remaining;
    }

    // Merge the menu_items array with the existing order.menu_items array
    const newMenuItems = order.menu_items.concat(menu_items);
    order.menu_items = newMenuItems;

    order.total_price = order.total_price + total_price
    order.menu_items.forEach(item => {
      item.item_id = new ObjectId(item.item_id);
    });
    const updatedOrder = await order.save()
    res.status(200).send(updatedOrder)
  } catch(error) {
    console.log(error)
    res.status(500).json({
      message: "Server error"
    })
  }
})


const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const  {status} = req.body

    //get the order
    const order = await Order.findById(orderId)
    if(!order) {
      res.status(400).json({
        message: "order not found"
      })
    }

    console.log(order)

    order.status = status;
    const updatedOrder = await order.save()
    res.status(204).send(updatedOrder)
  } catch(error) {
    console.log(error)
    res.status(500).json({
      message: "Server error"
    })
  }
})

const getCookOrders = asyncHandler(async (req, res) => {
  const  cookId  = req.params.id;
  console.log(cookId)
  const orders = await Order.find({
    cook: cookId,
    status: 'Confirmed' || 'Completed'
  })
  res.json(orders);
});

const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).send(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

 const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ $or: [
      {status: 'Pending'},
      {status: 'Confirmed'},
      {status: 'Prepared'}
  ],})
    if (!orders) {
      return res.status(404).json({ message: 'Orders not found' });
    }
    return res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

const getPaymentInfo = asyncHandler(async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;
    const tableNumber = req.query.tableNumber;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const orders = await Order.find({ restaurant_id: restaurantId, table_number: tableNumber, status: 'Delivered' });

    // Create an object to store the menu items and their quantities
    const menuItemsMap = new Map();

    // Iterate over the orders and update the menuItemsMap with the quantities
    orders.forEach(order => {
      order.menu_items.forEach(menuItem => {
        const { item_id, item_name, item_price, quantity } = menuItem;

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
          });
        }
      });
    });

    // Convert the map values to an array
    const menuItems = Array.from(menuItemsMap.values());

    const tempid = "price_1NJJWzSJv6spOPlPjEtcYLEn"

    const menuItemsNew = menuItems.map(item => {
        return { id: tempid, quantity: item.quantity };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: menuItemsNew,
      mode: 'payment',
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
  });

  res.send(JSON.stringify({
      url: session.url
  }));

    // const menuItemsNew = menuItems.flatMap(order => {
    //   return order.menu_items.map(menuItem => {
    //     return { id: menuItem.item_id, quantity: menuItem.quantity };
    //   });
    // });

    // res.json(menuItemsNew);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

export {
    placeOrder,
    updateOrder,
    updateOrderStatus,
    getCookOrders,
    getOrderDetails,
    getAllOrders,
    getPaymentInfo
}


