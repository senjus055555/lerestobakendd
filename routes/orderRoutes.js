import express from 'express'
import {placeOrder, updateOrder, updateOrderStatus, getCookOrders, getOrderDetails, getAllOrders, getPaymentInfo} from '../controllers/orderController.js'

const router = express.Router()

router.post('/', placeOrder)
// router.get('/:id', getOrderDetails)
router.get('/payment', getPaymentInfo)
router.get('/getall', getAllOrders)
router.put('/:id/status', updateOrderStatus)
router.get('/cook/:id', getCookOrders)

export default router