require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connect = require('./schemas');

const morgan = require('morgan');

const app = express();

// // Routers
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
const likeRouter = require('./routes/likes');
const subscribeRouter = require('./routes/subscribes');

// mongoDB Connect
connect();

// app.use((req, res, next) => {
//     console.log('Request URL:', `[${req.method}]`, req.originalUrl, ' - ', new Date().toLocaleString())
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 이미지 경로
app.use('/', express.static(path.join(__dirname, 'images')));

app.use(morgan('dev'));

app.use(
    cors({
        origin: '*',
        // credentials: true,
    })
);

// routers
app.use('/api', [userRouter, postRouter, commentRouter, likeRouter, subscribeRouter]);

// connections test
app.get('/', (req, res) => {
    res.send('hello from mytube');
});

app.use((err, req, res, next) => {
    res.status(401).send({ result: 'fail', msg: err.message });
});

app.listen(8080, () => {
    console.log('마이튜브 server is running on port=8080');
});
