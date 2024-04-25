import asyncHandler from 'express-async-handler'
import Restaurant from '../models/restaurantModel.js'
import User from '../models/userModel.js'

const getRestaurents = asyncHandler(async (req, res) => {
    const restaurents = await Restaurant.find({})
    res.status(200).send({
        restaurents
    })
})

const getRestaurentByCity = asyncHandler(async (req, res) => {
    const city = req.params.cityname
    const restaurents = await Restaurant.find({city: city})
    console.log(restaurents)
    res.status(200).send({
        restaurents
    })
})

const getRestaurentByCuisine = asyncHandler(async (req, res) => {
    const cuisine = req.params.cuisine
    const { city } = req.query;
    console.log(cuisine)
    console.log(city)
    const restaurents = await Restaurant.find({cuisines: {$in: [cuisine]}, city: { $regex: new RegExp(city, 'i') }})
    console.log(restaurents)
    res.status(200).json(restaurents)
})

const getRestaurentByAmbience = asyncHandler(async (req, res) => {
    const ambience = req.params.ambience
    const { city } = req.query;
    console.log(ambience)
    const restaurants = await Restaurant.find({ ambience: { $in: [ambience] }, city: { $regex: new RegExp(city, 'i') } });
    console.log(restaurants)  
    res.status(200).json(restaurants)
})

const searchData = asyncHandler(async (req, res) => {
    const query = req.query.dish
    const city = req.query.city
    try {
        // search restaurants by restaurant name or dish name
        const restaurants = await Restaurant.find({
          /*$or: [
            { restaurant_name: { $regex: query, $options: 'i' } },
            // { 'menu_items.item_name': { $regex: query, $options: 'i' } }
            {
              menu_items: {
                $elemMatch: {
                  item_name: { $regex: query, $options: "i" },
                  remaining: { $gt: 0 },
                },
              },
            },
          ]*/
          $and: [
            {
              $or: [
                { restaurant_name: { $regex: query, $options: "i" } },
                { "menu_items.item_name": { $regex: query, $options: "i" } },
              ],
            },
            { city: { $regex: city, $options: "i" } },
            { "menu_items.remaining": { $gt: 0 } },
          ],
        });
    
        res.status(200).json(restaurants);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
      }
})

const getRestaurentData = asyncHandler(async (req, res) => {
  try {
    const {id} = req.params
    const restaurant = await Restaurant.findById(id);
    if(restaurant) {
      return res.status(200).send(restaurant)
    }
  } catch(error) {
      return res.status(500).json({ error: error.message });
  }
})

const getRestaurentMenu = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }
        const menu = restaurant.menu_items;
        return res.json(menu);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
})

const getDishesByCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const categories = ['Starters', 'Live Counter', 'Soup', 'Main Course', 'Desserts', 'Beverages'];
    const menuItems = {};

    for (const category of categories) {
      const dishes = restaurant.menu_items.filter((item) => item.category === category && item.remaining >= 1);
      menuItems[category] = dishes;
      // const itemsInCategory = menuItems.filter(item => item.category === category && item.remaining >= 1);
      // menuByCategory[category] = itemsInCategory;
    }

    const cheffSpecials = restaurant.menu_items.filter(item => item.cheffSpecial === true);

    res.status(200).json({ menu: menuItems, cheffSpecials });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
})

const addRestaurantReview = async (req, res) => {
  try {
    const { restaurant_id, rating, comment } = req.body;
    const  userId  = req.user._id;

    const user = await User.findById(userId)
    const userName = user.username

    const restaurant = await Restaurant.findById(restaurant_id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const newReview = {
      reviewer_name: userName,
      review_text: comment,
      rating,
    };

    restaurant.reviews.push(newReview);
    await restaurant.save();

    res.status(200).json({ message: 'Review added successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

const getMenuItem = async (req, res) => {
  try {
    const menuItem = await Restaurant.findOne({ "menu_items._id": req.params.id }, { "menu_items.$": 1 });
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json(menuItem.menu_items[0]); 
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


export {
    getRestaurents,
    getRestaurentByCity,
    getRestaurentByCuisine,
    getRestaurentByAmbience,
    searchData,
    getRestaurentMenu,
    getMenuItem,
    getDishesByCategory,
    addRestaurantReview,
    getRestaurentData
}