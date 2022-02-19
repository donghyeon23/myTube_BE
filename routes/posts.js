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
    const existPosts = await Post.find({});
    const posts = existPosts.sort((a, b) => b.date - a.date);
    res.json({ result: 'success', posts });
});

// 특정 게시글 조회 API 통과
router.get('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId });
    res.json({ result: 'success', post: [post] });
});

//게시글 전체 삭제 기능 구현 완료 통과
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
    const { user_id } = res.locals.user;
    const { postId } = req.params;
    const existPost = await Post.findOne({ _id: postId });
    if (existPost) {
        if (existPost.user_id !== user_id) {
            return res.status(400).send({
                errorMessage: '자기 글만 삭제할 수 있습니다.',
            });
        } else {
            await deleteS3(existPost);
            await post.deleteOne({ _id: postId });
        }
    }
    res.json({ result: 'success', msg: '삭제되었습니다.' });
});

// 게시글 작성
router.post('/posts', authMiddleware, async (req, res) => {
    try {
        const { user_id } = res.locals.user;
        const { title, content, year, image } = req.body;
        // const image = req.file.location;
        const createdPost = await post.create({
            user_id,
            title,
            content,
            year: Number(year),
            image,
        });
        res.json({ result: 'success', msg: '작성 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ result: 'fail', msg: err });
    }
});

router.post(
    '/posts/imageUpload',
    authMiddleware,
    upload.single('image'),
    async (req, res) => {
        try {
            //const {user_id} = res.locals.user
            //const { title, content, year } = req.body; //여기서 user_id 지우고 res.locals에서 user_id 가져올 예정
            const image = req.file.location;
            // const createdpost = await post.create({
            // 	user_id,
            // 	title,
            // 	content,
            // 	year: Number(year),
            // 	image,
            // });
            res.json({ result: 'success', image });
        } catch (err) {
            res.status(400).json({ result: 'fail', msg: err });
        }
    }
);

// 게시글 수정 API 통과 // req.files.length =>   url 삭제, url 등록, 수정 ?
router.post('/posts/:postId', authMiddleware, async (req, res) => {
    const { user_id } = res.locals.user;
    const { postId } = req.params;
    const existpost = await post.findOne({ _id: postId });
    const { title, content, year, image } = req.body;
    // let image = "";
    // if (req.files.length) {
    // 	await deleteS3(existpost);
    // 	image = req.files[0].location;
    // } else {
    // 	image = existpost.image
    // }

    if (existpost) {
        if (user_id !== existpost.user_id) {
            return res.status(400).send({
                result: 'fail',
                errorMessage: '자기글만 수정할 수 있습니다.',
            });
        } else {
            if (existpost.image !== image) {
                await deleteS3(existpost);
            }
            await post.updateOne(
                { _id: postId },
                { $set: { title, content, year, image } }
            );
            console.log('게시글 수정 완료!');
        }
    }
    res.json({ result: 'success', msg: '수정되었습니다.' });
});

router.post('/posts', async (req, res) => {
    try {
        // const { user_id } = res.locals.user
        const { user_id, title, content, videoUrl, category } = req.body;

        const findUser = await User.findOne({ user_id: user_id });
        channelName = findUser.channelName;
        // console.log(findUser);
        // const image = req.file.location;
        const createdPost = new Post({
            channelName,
            title,
            content,
            videoUrl,
            category,
        });

        await createdPost.save();
        // await User.findOneAndUpdate({ user_id: channelName.user_id }, { posts : createdPost.postId })

        res.json({ result: 'success', msg: '작성 완료 되었습니다.' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ result: 'fail', msg: err });
    }
});

//전체 게시글 조회
// router.get('/posts', async (req, res) => {
//     const existPosts = await Post.find({})
//     const posts = existPosts.sort((a, b) => b.createdAt - a.createdAt)
//     res.json({ result: 'success', posts })
// })

// 메인페이지
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;

        //전체 게시글 조회
        if (!category || category === null || category === undefined) {
            const posts = await Post.find().sort('-createdAt');
            return res.json({ result: 'success', posts });
        }

        //특정 카테고리 게시글 조회
        const selectedCategory = await Post.find({ category: category });
        if (!selectedCategory) {
            return res.status(400).send({
                errorMessage: '해당하는 동영상이 없습니다.',
            });
        }
        res.json(selectedCategory);
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;
