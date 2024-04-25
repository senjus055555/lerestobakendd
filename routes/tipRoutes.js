import express from 'express'
import {tipCook} from '../controllers/tipController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/:id', protect, tipCook)

export default router