const express = require('express');
const router = express.Router();

// Schemas
const Post = require('../schemas/post');
const Like = require('../schemas/like');

// MiddleWares
const authMiddleware = require('../middlewares/auth-middleware');

//좋아요 (추가)
router.post('/posts/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId } = req.params;

        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(400).send({ result: 'fail', msg: '존재하지 않는 동영상입니다' });
        }
        const existLike = await Like.findOne({ channelName, postId: post });
        if (existLike) {
            return res.status(400).send({ result: 'fail', msg: '이미 좋아요 했습니다' });
        }
        const createdLike = new Like({
            channelName,
            postId: post,
        });
        await createdLike.save();

        res.send({ result: 'success', msg: '좋아요 완료!' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});

//좋아요 (취소)         //delete? notion에는 patch로 되어있음
router.delete('/posts/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId } = req.params;

        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(400).send({ result: 'fail', msg: '존재하지 않는 동영상입니다' });
        }
        const existLike = await Like.findOne({ channelName, postId: post });
        if (!existLike) {
            return res.status(400).send({ result: 'fail', msg: '이미 취소 했습니다' });
        }
        await Like.deleteOne({ channelName, postId: post });

        res.send({ result: 'success', msg: '좋아요 취소 완료' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});

module.exports = router;
