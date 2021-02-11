const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const userRouter = require('./app/routes/UserRoute');

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


mongoose
    .connect('mongodb://localhost:27017/eventmanagementmongo', {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => { console.log("Connected to Database") })
    .catch((err) => {
        console.log(err)
    });

app.use('/user', userRouter);


app.listen(port, () => {
    console.log("Server is started at Port No " + port)
});
