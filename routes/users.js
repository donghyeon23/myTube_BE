const express = require("express");
const router = express.Router();
const User = require("../schemas/user");



router.post("/users", async (req, res) => {
    const { user_id, userName ,password } = req.body;
    console.log(req)
    const existsUsers = await User.findOne({ user_id });
    if (existsUsers) {
        // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
        return res.status(400).send({
            errorMessage: "ID가 이미 사용중입니다.",
        });
    }

    const user = new User({ user_id, userName, password });
    await user.save();

    console.log(user_id, '회원가입 완료!')
    res.status(201).send({ result: 'success', msg: '회원가입에 성공하였습니다.' });
});



module.exports = router;