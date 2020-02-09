const express = require('express')
const { auth, authEmail } = require('../helpers/auth')
const { userController } = require('../controller')

const router = express.Router()

router.post('/register', userController.register)
router.post('/resendEmail', userController.resendEmail)
router.post('/emailConfirmed', authEmail, userController.emailConfirmed)

router.post('/login', userController.userLogin)
router.post('/keepLogin', auth, userController.userKeepLogin)

module.exports = router