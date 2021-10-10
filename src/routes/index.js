import { Router, static } from 'express'
import { STATIC_FILES_PATH } from '../config/files'
import VideoController from '../controllers/video-controller'

const router = Router()

router.get('/video', VideoController.getVideo)
router.use(static(STATIC_FILES_PATH))

export default router
