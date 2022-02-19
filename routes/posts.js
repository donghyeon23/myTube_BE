const express = require('express');
const router = express.Router();

// Schemas
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
const User = require('../schemas/user');

// MiddleWares
const authMiddleware = require('../middlewares/auth-middleware');
const { upload } = require('../middlewares/upload');

// delete obj in S3 module
const deleteS3 = require('../middlewares/deleteS3');

// 전체 게시글 조회 API 통과
router.get('/posts', async (req, res) => {
    try {
        const { category } = req.query;

        //전체 게시글 조회
        if (!category || category === null || category === undefined) {
            const posts = await Post.find().sort('-createdAt');
            return res.send({ result: 'success', posts });
        }

        //특정 카테고리 게시글 조회
        const selectedCategory = await Post.find({ category: category });
        if (!selectedCategory) {
            return res.status(400).send({
                errorMessage: '해당하는 동영상이 없습니다.',
            });
        }
        res.send(selectedCategory);
    } catch (error) {
        console.error(error);
    }
});

// 특정 게시글 조회 
router.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId)
        post.views++;
        await post.save();
        res.send({ result: 'success', post });
    } catch (error) {
        console.error(error);
    };
});

// 게시글 작성
router.post('/posts', authMiddleware, upload.fields([{ name: 'videoFile', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { title, content, category } = req.body;
        // console.log(req.files.videoFile, req.files.image)
        const videoUrl = req.files.videoFile[0].location;
        const imageUrl = req.files.image[0].location;
        const createdPost = await Post.create({
            channelName,
            title,
            content,
            category,
            imageUrl,
            videoUrl,
        });
        res.send({ result: 'success', msg: '작성 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});


//게시글 삭제
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { channelName } = res.locals.user;
        const { postId } = req.params;
        const existPost = await Post.findOne({ _id: postId });
        if (existPost) {
            if (existPost.channelName !== channelName) {
                return res.status(400).send({
                    errorMessage: '자기 글만 삭제할 수 있습니다.',
                });
            } else {
                await deleteS3(existPost);
                await Post.deleteOne({ _id: postId });
            }
        }
        res.send({ result: 'success', msg: '삭제되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).send({ result: 'fail', msg: err });
    }
});


module.exports = router;
