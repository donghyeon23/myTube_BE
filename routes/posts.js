const express = require('express');
const router = express.Router();

// Schemas
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const User = require('../schemas/user');
const Like = require('../schemas/like');

// MiddleWares
const authMiddleware = require('../middlewares/auth-middleware');
const { upload } = require('../middlewares/upload');

// delete obj in S3 module
const deleteS3 = require('../middlewares/deleteS3');

// 전체 게시글 조회 API 통과
router.get('/posts', async (req, res) => {
    try {
        const { category, search } = req.query;
        const selector =
            'channelName profile title content imageUrl videoUrl category views createdAt';
        console.log(category, search);
        //전체 게시글 조회
        if (
            (!category || category === null || category === undefined) &&
            (!search || search === null || search === undefined)
        ) {
            const posts = await Post.find().sort('-createdAt').select(selector);
            return res.send({ result: 'success', posts });
        }

        // 특정 카테고리 조회
        if (category) {
            const selectedCategory = await Post.find({ category: category })
                .sort('-createdAt')
                .select(selector); //특정 카테고리 게시글 조회
            return res.send({ result: 'success', posts: selectedCategory });
        }

        // 특정 검색어 조회
        if (search) {
            const searchOption1 = search.replaceAll(' ', ''); // 키워드에 공백 제거
            console.log(searchOption1);
            const selectedSearch = await Post.find({
                $or: [
                    { channelName: { $regex: search } },
                    { content: { $regex: search } },
                    { title: { $regex: search } },
                    { channelName: { $regex: searchOption1 } },
                    { content: { $regex: searchOption1 } },
                    { title: { $regex: searchOption1 } },
                ],
            })
                .sort('-createdAt')
                .select(selector);

            return res.send({ result: 'success', posts: selectedSearch });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({ result: 'fail', msg: '조회에 실패했습니다' });
    }
});

// 특정 게시글 조회
router.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId)
            .select('channelName profile title content imageUrl videoUrl category views createdAt')
            .populate('commentsCount likesCount')
            .populate('likes', { _id: false, channelName: 1 });

        post.views++;
        await post.save();

        res.send({ result: 'success', post });
    } catch (error) {
        console.error(error);
        res.status(404).send({ result: 'fail', msg: '존재하지 않는 동영상입니다.' });
    }
});

// 게시글 작성
router.post(
    '/posts',
    authMiddleware,
    upload.fields([
        { name: 'videoFile', maxCount: 1 },
        { name: 'imageFile', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const { channelName } = res.locals.user;
            const { profile } = res.locals.user;
            const { title, content, category } = req.body;
            const videoUrl = req.files.videoFile[0].location;
            const imageUrl = req.files.imageFile[0].location;
            const createdPost = await Post.create({
                channelName,
                profile,
                title,
                content,
                category,
                imageUrl,
                videoUrl,
            });
            res.send({ result: 'success', msg: '작성 완료 되었습니다.' });
        } catch (err) {
            console.log(err);
            res.status(400).send({ result: 'fail', msg: '작성에 실패했습니다' });
        }
    }
);

//게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId } = req.params;
        const existPost = await Post.findOne({ _id: postId });
        if (existPost) {
            if (existPost.channelName !== channelName) {
                return res.status(400).send({
                    errorMessage: '본인이 업로드한 동영상만 삭제할 수 있습니다.',
                });
            } else {
                await deleteS3(existPost);
                await Post.deleteOne({ _id: postId });
                await Comment.deleteMany({ postId });
                await Like.deleteMany({ postId });
                return res.send({ result: 'success', msg: '삭제되었습니다.' });
            }
        }
        res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: '잘못된 요청입니다.' });
    }
});

module.exports = router;
