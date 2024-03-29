const express = require('express')
const { campaignController } = require('../controller')

const router = express.Router()

router.get('/getAllCampaign', campaignController.getAllCampaign)
router.get('/getCampaignById', campaignController.getCampaignById)
router.get('/getCampaignByUser', campaignController.getCampaignByUser)
router.get('/getNewCampaign', campaignController.getNewCampaign)
router.post('/buatCampaign', campaignController.buatCampaign)

module.exports = router