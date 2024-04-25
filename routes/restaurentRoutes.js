import express from 'express'
import { getRestaurents, getRestaurentByCity, getRestaurentByCuisine, getRestaurentByAmbience, searchData, getRestaurentMenu, getDishesByCategory, addRestaurantReview, getMenuItem, getRestaurentData } from '../controllers/restaurentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getRestaurents)
router.get('/city/:cityname', getRestaurentByCity)
router.get('/cuisine/:cuisine', getRestaurentByCuisine)
router.get('/ambience/:ambience', getRestaurentByAmbience)
router.get('/search', searchData)
router.get('/info/:id', getRestaurentData)
router.get('/:id', getRestaurentMenu)
router.get('/menuItem/:id', getMenuItem)
router.get('/:id/dishes', getDishesByCategory)
router.post('/review', protect, addRestaurantReview)


export default router  