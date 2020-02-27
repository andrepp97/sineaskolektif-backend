const { sqlDB } = require('../database')

module.exports = {
    buatCampaign: (req, res) => {
        var datetime = new Date();
        req.body.created_date = datetime
        req.body.status = 'pending'

        var sql = `INSERT INTO campaign SET ?`
        sqlDB.query(sql, req.body, (err, results) => {
            if (err) return res.status(500).send(err)

            res.status(200).send('Berhasil Menyimpan Campaign')
        })
    },
}