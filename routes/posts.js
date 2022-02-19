const express = require('express')
const router = express.Router()
const Post = require('../schemas/post')
const User = require('../schemas/user')
const Comment = require('../schemas/comment')



router.post('/posts', async (req, res) => {
    try {
        // const { user_id } = res.locals.user
        const { user_id, title, content, videoUrl, category } = req.body

        const findUser = await User.findOne({ user_id: user_id })
        userName = findUser.userName
        // console.log(findUser);
        // const image = req.file.location;
        const createdPost = new Post({
            userName,
            title,
            content,
            videoUrl,
            category,
        })

        await createdPost.save()
        // await User.findOneAndUpdate({ user_id: userName.user_id }, { posts : createdPost.postId })

        res.json({ result: 'success', msg: '작성 완료 되었습니다.' })
    } catch (err) {
        console.log(err)
        res.status(400).json({ result: 'fail', msg: err })
    }
})

//전체 게시글 조회
// router.get('/posts', async (req, res) => {
//     const existPosts = await Post.find({})
//     const posts = existPosts.sort((a, b) => b.createdAt - a.createdAt)
//     res.json({ result: 'success', posts })
// })

// 메인페이지
router.get("/", async (req, res) => {
    try {
       const { category } = req.query;
  
      //전체 게시글 조회
      if (!category || category === null || category === undefined) {
        const posts = await Post.find( ).sort('-createdAt');
        return res.json({ result: 'success', posts });
      }
  
      //특정 카테고리 게시글 조회
      const selectedCategory = await Post.find({ category: category});
      if (!selectedCategory) {
        return res.status(400).send({
          errorMessage: "해당하는 동영상이 없습니다.",
        });
      }
      res.json(selectedCategory);
    } catch (error) {
      console.error(error);
    }
  });

module.exports = router
