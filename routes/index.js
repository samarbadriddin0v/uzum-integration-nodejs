const Router = require('express')
const uzumCheckToken = require('../middlewares/uzum.middleware')
const uzumController = require('../controllers/uzum.controller')

const router = new Router()

router.post('/check', uzumCheckToken, uzumController.check)
router.post('/create', uzumCheckToken, uzumController.create)
router.post('/confirm', uzumCheckToken, uzumController.confirm)
router.post('/reverse', uzumCheckToken, uzumController.reverse)
router.post('/status', uzumCheckToken, uzumController.status)

module.exports = router
