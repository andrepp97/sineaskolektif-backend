const fs = require('fs')
const { sqlDB } = require('../database')
const { uploader } = require('../helpers/uploader')

module.exports = {
    getNewCampaign: (req, res) => {
        var sql = `SELECT c.*, u.username
                   FROM campaign c
                   JOIN m_users u ON u.id = c.idUser
                   ORDER BY c.created_date DESC
                   LIMIT 3`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(results)
        })
    },

    getCampaignByUser: (req, res) => {
        var sql = `SELECT * FROM campaign WHERE idUser = '${req.query.id}'`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(results)
        })
    },

    buatCampaign: (req, res) => {
        const path = '/campaign'
        const upload = uploader(path, 'UCI_').fields([{
            name: 'image'
        }])

        upload(req, res, (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            // IMAGE
            const {image} = req.files;

            // DATA
            let data = JSON.parse(req.body.data)
            var datetime = new Date()
            data.created_date = datetime
            data.status = 'pending'
            
            // PATH
            var imgPath = path + '/' + image[0].filename
            data.image = imgPath
            console.log(data)

            var sql = `INSERT INTO campaign SET ?`
            sqlDB.query(sql, data, (err, results) => {
                if (err) {
                    fs.unlinkSync(`./public${imgPath}`)
                    return res.status(500).send(err)
                }

                res.status(200).send('UPLOAD SUCCESS')
            })
        })
    },
}