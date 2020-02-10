const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sineaskolektif@gmail.com',
        pass: 'foucefsviogsbknw'
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = {
    transporter
}