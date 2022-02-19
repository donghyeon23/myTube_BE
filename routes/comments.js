const express = require('express');
const router = express.Router();

// Schemas
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const User = require('../schemas/user');

// MiddleWares
const authMiddleware = require('../middlewares/auth-middleware');


router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId } = req.params;
        const { comment } = req.body;

        // const userId = await User.findOne({ channelName });
        const post = await Post.findOne({ postId });

        const createdComment = new Comment({
            channelName,
            postId: post,
            comment,
        });
        await createdComment.save();

        res.send({ result: 'success', msg: '생성 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});

module.exports = router;