const Router = require('express')
const uzumCheckToken = require('../middlewares/uzum.middleware')
const uzumController = require('../controllers/uzum.controller')

const router = new Router()

router.post('/check', uzumController.check)
router.post('/create', uzumController.create)
router.post('/confirm', uzumController.confirm)
router.post('/reverse', uzumController.reverse)
router.post('/status', uzumController.status)

module.exports = router
