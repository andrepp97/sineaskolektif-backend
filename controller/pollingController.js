const fs = require('fs')
const { sqlDB } = require('../database')
const { uploader } = require('../helpers/uploader')

module.exports = {
    getPollingByUser: (req, res) => {
        var sql = `SELECT * FROM polling WHERE idUser = '${req.query.id}'`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(results)
        })
    },

    getNewPolling: (req, res) => {
        var sql = `SELECT p.*, u.username
                   FROM polling p
                   JOIN m_users u ON u.id = p.idUser
                   ORDER BY p.created_date DESC
                   LIMIT 3`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send(err)

            res.status(200).send(results)
        })
    },

    buatPolling: (req, res) => {
        const path = '/polling'
        const upload = uploader(path, 'UPI_').fields([{
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

            // MANIPULATE QUESTIONS
            let questions = data.questions
            delete data.questions

            // PATH
            var imgPath = path + '/' + image[0].filename
            data.image = imgPath
            // console.log(data)

            var sql = `INSERT INTO polling SET ?`
            sqlDB.query(sql, data, (err, results) => {
                if (err) {
                    fs.unlinkSync(`./public${imgPath}`)
                    return res.status(500).send(err)
                }

                // SELECT ID TERAKHIR POLLING
                sql = `SELECT id
                       FROM polling
                       WHERE idUser = '${data.idUser}'
                       ORDER BY id DESC LIMIT 1`
                sqlDB.query(sql, (err, results) => {
                    if (err) {
                        fs.unlinkSync(`./public${imgPath}`)
                        return res.status(500).send(err)
                    }

                    let idPolling = results[0].id
                    
                    var sql2 = '',
                        sql3 = ''
                        idQ = 0

                    var sqlQ = `SELECT count(id) as numb FROM polling_questions`
                    sqlDB.query(sqlQ, (err, results) => {
                        if (err) {
                            return res.status(500).send(err)
                        }
                        idQ = results[0].numb + 1
                    })

                    // INSERT POLLING QUESTIONS
                    for (let i = 0; i < questions.length; i++) {
                        sql2 = `INSERT INTO polling_questions (idPolling, question) VALUES ('${idPolling}', '${questions[i].question}')`
                        sqlDB.query(sql2, (err, results) => {
                            if (err) {
                                return res.status(500).send(err)
                            }

                            var options = questions[i].options

                            for (let j = 0; j < options.length; j++) {
                                sql3 = `INSERT INTO polling_options (idQuestion, option_string) VALUES (${idQ}, '${options[j]}')`
                                sqlDB.query(sql3, (err, results) => {
                                    if (err) {
                                        return res.status(500).send(err)
                                    }

                                    return true
                                })
                            }

                            idQ += 1
                        })
                    }
                    return res.status(200).send('OK')
                })
            })
        })
    },
}