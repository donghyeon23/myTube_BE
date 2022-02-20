const express = require('express');
const router = express.Router();

// Schemas
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const User = require('../schemas/user');

// MiddleWares
const authMiddleware = require('../middlewares/auth-middleware');

// 댓글 작성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId } = req.params;
        const { comment } = req.body;

        // const userId = await User.findOne({ channelName });
        const post = await Post.findOne({ postId });
        const user = await User.findOne({ channelName });

        const createdComment = new Comment({
            channelName,
            postId: post,
            profile: user.profile,
            comment,
        });
        await createdComment.save();

        res.send({ result: 'success', msg: '생성 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
    }
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId, commentId } = req.params;
        const { comment } = req.body;

        const existComment = await Comment.findOne({ commentId });

        if (channelName !== existComment.channelName) {
            return res
                .status(401)
                .send({ result: 'fail', msg: '본인이 작성한 댓글만 수정 가능합니다.' });
        }

        if (postId !== existComment.postId.toHexString()) {
            return res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
        }

        await Comment.findOneAndUpdate({ commentId }, { comment });

        res.send({ result: 'success', msg: '수정 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
    }
});

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId, commentId } = req.params;

        const existComment = await Comment.findOne({ commentId });

        if (channelName !== existComment.channelName) {
            return res
                .status(401)
                .send({ result: 'fail', msg: '본인이 작성한 댓글만 삭제 가능합니다.' });
        }

        if (postId !== existComment.postId.toHexString()) {
            return res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
        }

        await Comment.deleteOne({ comment_id: commentId });

        res.send({ result: 'success', msg: '삭제 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
    }
});

module.exports = router;
