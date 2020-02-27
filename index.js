const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const bearerToken = require('express-bearer-token')

const app = express()
const port = process.env.PORT || 2000

app.use(cors())
app.use(bearerToken())
app.use(bodyParser.json())

const {
    userRouter,
    campaignRouter
} = require('./router')

app.get('/', (req, res) => {
    res.status(200).send('<h2>WELCOME TO SINEAS KOLEKTIF API</h2>')
})

app.use('/user', userRouter)
app.use('/campaign', campaignRouter)


app.listen(port, () => console.log('API aktif di port ' + port))