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
                sql = `SELECT last_insert_id() as lastId`
                sqlDB.query(sql, (err, results) => {
                    if (err) {
                        console.log('Error di LAST INSERT ID POLLING')
                        return res.status(500).send(err)
                    }
                    
                    let idPolling = results[0].lastId
                    
                    var sql2 = 'INSERT INTO polling_questions (idPolling, question) VALUES ',
                        sql3 = 'INSERT INTO polling_options (idQuestion, option_string) VALUES ',
                        idQ = 0
                    
                    var sqlQ = `SELECT max(id) as numb FROM polling_questions`
                    sqlDB.query(sqlQ, (err, results) => {
                        if (err) {
                            console.log('Error di GET LAST QUESTION ID')
                            return res.status(500).send(err)
                        }
                        idQ = results[0].numb + 1

                        // POLLING QUESTIONS
                        for (let i = 0; i < questions.length; i++) {
                            if (i === questions.length - 1) {
                                sql2 += `('${idPolling}', '${questions[i].question}')`
                            } else {
                                sql2 += `('${idPolling}', '${questions[i].question}'),`
                            }

                            // POLLING OPTIONS
                            var options = questions[i].options
                            for (let j = 0; j < options.length; j++) {
                                if (j === options.length - 1 && i === questions.length - 1) {
                                    sql3 += `(${idQ}, '${options[j]}')`
                                } else {
                                    sql3 += `(${idQ}, '${options[j]}'),`
                                }
                            }

                            // ID QUESTION +1
                            idQ += 1
                        }

                        // EXECUTE INSERT QUESTIONS & OPTIONS
                        sqlDB.query(sql2, (err, results) => {
                            if (err) return res.status(500).send(err)

                            sqlDB.query(sql3, (err, results) => {
                                if (err) return res.status(500).send(err)

                                return res.status(200).send('OK')
                            })
                        })
                    })
                })
            })
        })
    },
}