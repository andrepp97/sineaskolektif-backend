const express = require('express')
const { campaignController } = require('../controller')

const router = express.Router()

router.post('/buatCampaign', campaignController.buatCampaign)

module.exports = router