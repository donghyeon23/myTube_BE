const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middlewares/auth-middleware');
const { JWT_SECRET_KEY } = process.env;

//회원가입
router.post('/user/signup', async (req, res) => {
    try {
        const { user_id, channelName, password } = req.body;
        const encryptedPassword = bcrypt.hashSync(password, 10); // password 암호화
        const existsUsers = await User.findOne({ user_id });
        const existsChannelname = await User.findOne({ channelName });
        const checkUserid = /^(?=.*[a-zA-Z])(?=.*[0-9])[0-9a-zA-Z]{4,16}$/; //영문(필수),숫자(필수)로 이루어진 4~16글자 아이디 체크
        const checkchannelName = /^[0-9a-zA-Zㄱ-ㅎ가-힣ㅏ-ㅣ]{2,16}$/; //영문 or 숫자 or 한글로 이루어진 ~16글자 닉네임 체크
        const checkpwd = /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{4,20}$/; //영문(필수), 숫자(필수), 특수문자(선택) 4~20글자 비밀번호 체크
        if (!checkUserid.test(user_id)) {
            return res.status(400).send({
                errorMessage: '아이디 양식을 확인하세요.',
            });
        }
        if (!checkchannelName.test(channelName)) {
            return res.status(400).send({
                errorMessage: '닉네임 양식을 확인하세요.',
            });
        }
        if (!checkpwd.test(password)) {
            return res.status(400).send({
                errorMessage: '비밀번호 양식을 확인하세요.',
            });
        }
        if (existsUsers) {
            //아이디중복
            return res.status(400).send({
                errorMessage: 'ID가 이미 사용중입니다.',
            });
        }
        if (existsChannelname) {
            //닉네임(channelName) 중복
            return res.status(400).send({
                errorMessage: '채널명이 이미 사용중입니다.',
            });
        }
        const user = new User({
            user_id,
            channelName,
            password: encryptedPassword,
        });
        await user.save();
        res.status(201).send({
            msg: '회원가입 성공',
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({
            errorMessage: '입력정보를 다시 확인해주세요.',
        });
    }
});

// 아이디 중복 체크하기 (중복확인 버튼 클릭 시)
router.post('/check', async (req, res, next) => {
    try {
        const { user_id } = req.body;
        const user = await User.findOne({ user_id });

        if (!user.length) {
            return res.send({
                msg: '가입가능',
            });
        } else {
            return res.send({
                errorMessage: '이미 있는 아이디입니다.',
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 로그인
// NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
router.post('/user/login', async (req, res, next) => {
    try {
        const { user_id, password } = req.body;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(400).send('아이디가 존재하지 않습니다.');
        }

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            return res.status(400).send('비밀번호가 일치하지 않습니다.');
        }

        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET_KEY);

        res.send({ token });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 사용자 인증(로그인 상태를 확인해주는 기능)
router.get('/user/me', authMiddleware, (req, res) => {
    const { user } = res.locals;
    res.send({
        channelName: user.channelName,
    });
});

module.exports = router;
