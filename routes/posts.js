const express = require("express");
const router = express.Router();
const Post = require("../schemas/post");
const User = require("../schemas/user")



router.get("/posts", async (req, res) => {
	const existPosts = await Post.find({});
	const posts = existPosts.sort((a, b) => b.createdAt - a.createdAt);
	res.json({ result: "success", posts });
});


router.post("/posts", async (req, res) => {
	try {
		// const { user_id } = res.locals.user
		const { user_id, title, content, videoUrl, category } = req.body;
        
        const findUser = await User.findOne({user_id : user_id});
        userName = findUser.userName
        // console.log(findUser);
		// const image = req.file.location;
		const createdPost = new Post({
			userName,
			title,
			content,
			videoUrl,
            category,
		});

        await createdPost.save();
        // await User.findOneAndUpdate({ user_id: userName.user_id }, { posts : createdPost.postId })

		res.json({ result: "success", msg: "작성 완료 되었습니다." });
	} catch (err) {
		console.log(err)
		res.status(400).json({ result: "fail", msg: err });
	}
});

module.exports = router;