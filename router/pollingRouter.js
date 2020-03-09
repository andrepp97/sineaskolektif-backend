const express = require('express')
const { pollingController } = require('../controller')

const router = express.Router()

router.get('/getPollingByUser', pollingController.getPollingByUser)
router.get('/getNewPolling', pollingController.getNewPolling)
router.post('/buatPolling', pollingController.buatPolling)

module.exports = router