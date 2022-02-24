const express = require('express');
const router = express.Router();

// Schemas
const User = require('../schemas/user');
const Subscribe = require('../schemas/subscribe');

// MiddleWares
const authMiddleware = require('../middlewares/auth-middleware');

// 구독
router.post('/posts/:channelName/subscribe', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const subscribe = req.params.channelName;

        const channel = await User.findOne({ channelName: subscribe });
        if (!channel) {
            return res.status(400).send({ result: 'fail', msg: '존재하지 않는 채널입니다' });
        }
        const existSub = await Subscribe.findOne({ channelName, subscribe: channel._id });
        if (existSub) {
            return res.status(400).send({ result: 'fail', msg: '이미 구독 했습니다' });
        }
        const createdSub = new Subscribe({
            channelName,
            subscribe: channel._id,
        });
        await createdSub.save();

        res.send({ result: 'success', msg: '구독 완료!' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});

//구독 취소
router.delete('/posts/:channelName/subscribe', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const subscribe = req.params.channelName;

        const channel = await User.findOne({ channelName: subscribe });
        if (!channel) {
            return res.status(400).send({ result: 'fail', msg: '존재하지 않는 채널입니다' });
        }
        const existSub = await Subscribe.findOne({ channelName, subscribe: channel._id });
        if (!existSub) {
            return res.status(400).send({ result: 'fail', msg: '이미 취소 했습니다' });
        }

        await Subscribe.deleteOne({ channelName, subscribe: channel._id });

        res.send({ result: 'success', msg: '취소 완료!' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});

module.exports = router;
