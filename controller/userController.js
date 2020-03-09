const crypto = require('crypto')
const { sqlDB } = require('../database')
const { createJWTToken } = require('../helpers/jwt')
const { transporter } = require('../helpers/mailer')

const secret = 'sineas'
// const address = 'http://localhost:3000'
const address = 'https://sineaskolektif-frontend.now.sh'

module.exports = {

    register: (req, res) => {
        // APPEND TO REQ.BODY //
        req.body.role = 'user'
        req.body.status = 'unverified'
        req.body.created_date = new Date()

        // Encrypt //
        req.body.password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex')

        // SELECT duplicate email
        var sql = `SELECT * FROM m_users WHERE email = '${req.body.email}'`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send(err)

            // Send error jika duplicate
            if (results.length > 0) {
                return res.status(400).send('duplicate')
            }

            // INSERT user jika tidak duplicate
            var sql2 = `INSERT INTO m_users SET ?`
            sqlDB.query(sql2, req.body, (err, results) => {
                if (err) return res.status(500).send(err)

                // Create TOKEN
                const token = createJWTToken({
                    email: req.body.email
                })

                // Email Verification
                var mailOptions = {
                    from: "SINEAS KOLEKTIF <andreputerap@gmail.com>",
                    to: req.body.email,
                    subject: "Email Confirmation",
                    html: `
                        <h2>SELAMAT DATANG DI SINEAS KOLEKTIF</h2>
                        <h3>Klik link di bawah ini untuk konfirmasi email anda</h3>
                        <h4><a href='${address}/emailverified?token=${token}' target='_blank'>CLICK HERE</a></h4>
                    `
                }
                transporter.sendMail(mailOptions, (err, results) => {
                    if (err) return res.status(500).send(err)
                    res.status(200).send('Email Sent!')
                })
            })
        })
    },

    resendEmail: (req, res) => {
        // Create TOKEN
        const token = createJWTToken({
            email: req.body.email
        })

        var mailOptions = {
            from: "SINEAS KOLEKTIF <andreputerap@gmail.com>",
            to: req.body.email,
            subject: "Email Confirmation",
            html: `
                    <h2>SELAMAT DATANG DI SINEAS KOLEKTIF</h2>
                    <h3>Klik link di bawah ini untuk konfirmasi email anda</h3>
                    <h4><a href='${address}/emailverified?token=${token}' target='_blank'>CLICK HERE</a></h4>
                `
        }

        transporter.sendMail(mailOptions, (err, results) => {
            if (err) {
                return res.status(500).send({
                    message: 'Kirim Email Confirmation Gagal!',
                    error: false,
                    err
                })
            }

            res.status(200).send({
                message: 'Email Terkirim!',
                results
            })
        })
    },

    emailConfirmed: (req, res) => {
        let stat = 'verified'

        var sql = `UPDATE m_users SET status='${stat}' WHERE email = '${req.email}'`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send({
                status: 'error',
                err
            })

            sql = `SELECT * FROM m_users WHERE email = '${req.email}'`
            sqlDB.query(sql, (err, results) => {
                if (err) return res.status(500).send(err)
                
                var token = createJWTToken({
                    ...results[0]
                }, {
                    expiresIn: '24h'
                })

                res.status(200).send({
                    ...results[0], token
                })
            })
        })
    },

    userLogin: (req, res) => {
        var { email, password } = req.body;
            password = crypto.createHmac('sha256', secret)
                            .update(password)
                            .digest('hex')

        let sql = `SELECT * FROM m_users
                   WHERE email = '${email}'`
        
        sqlDB.query(sql, (err, results) => {
            if (err){
                return res.status(500).send(err)
            }

            if(results.length === 0) {
                return res.status(403).send('NoResult')
            }

            let sql2 = `SELECT * FROM m_users
                        WHERE email = '${email}' AND password = '${password}'`
            
            sqlDB.query(sql2, (err2, results2) => {
                if (err2) {
                    return res.status(500).send(err2)
                }

                if (results2.length === 0) {
                    return res.status(403).send('WrongPass')
                }

                var token = createJWTToken({ ...results2[0] }, { expiresIn: '24h' })
                res.status(200).send({ ...results2[0], token })
            })
        })
    },

    userKeepLogin: (req, res) => {
        res.status(200).send({
            ...req.user
        })
    },

}