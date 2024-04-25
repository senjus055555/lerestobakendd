import express from 'express'
import {authUser, registerUser, authCook} from '../controllers/userController.js'
import {protect} from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', registerUser)
router.post('/login', authUser)
router.post('/cooklogin', authCook)

export default router
