const express = require('express')
const router = express.Router()
const { User } = require('../schemas/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authMiddleware = require('../middlewares/auth-middleware')

//회원가입
router.post('/signup', async (req, res) => {
    try {
        const { user_id, userName, password } = req.body
        const encryptedPassword = bcrypt.hashSync(password, 10) // password 암호화
        const existsUsers = await User.findOne({ user_id })
        const existsUsername = await User.findOne({ userName })
        const checkUserid = /^(?=.*[a-zA-Z])(?=.*[0-9])[0-9a-zA-Z]{4,16}$/ //영문(필수),숫자(필수)로 이루어진 4~16글자 아이디 체크
        const checkuserName = /^[0-9a-zA-Zㄱ-ㅎ가-힣ㅏ-ㅣ]{4,16}$/ //영문 or 숫자 or 한글로 이루어진 4~16글자 닉네임 체크    특수문자 필요할까?
        const checkpwd = /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{4,20}$/ //영문(필수), 숫자(필수), 특수문자(선택) 4~20글자 비밀번호 체크
        if (!checkUserid.test(user_id)) {
            return res.status(400).send({
                errorMessage: '아이디 양식을 확인하세요.',
            })
        }
        if (!checkuserName.test(userName)) {
            return res.status(400).send({
                errorMessage: '닉네임 양식을 확인하세요.',
            })
        }
        if (!checkpwd.test(password)) {
            return res.status(400).send({
                errorMessage: '비밀번호 양식을 확인하세요.',
            })
        }
        if (existsUsers) {
            //아이디중복
            return res.status(400).send({
                errorMessage: 'ID가 이미 사용중입니다.',
            })
        }
        if (existsUsername) {
            //닉네임(userName) 중복
            return res.status(400).send({
                errorMessage: '닉네임이 이미 사용중입니다.', //userName을 nickname으로 바꿔야 할 듯?
            })
        }
        await User.create({
            user_id,
            userName,
            password: encryptedPassword,
        })
        res.status(201).json({
            msg: '회원가입 성공',
        })
    } catch (error) {
        res.status(400).json({
            errorMessage: '입력정보를 다시 확인해주세요.',
        })
    }
})

// 아이디 중복 체크하기 (중복확인 버튼 클릭 시)
router.post('/check', async (req, res, next) => {
    try {
        const { user_id } = req.body
        const user = await User.findOne({ user_id })

        if (!user.length) {
            return res.json({
                msg: '가입가능',
            })
        } else {
            return res.json({
                errorMessage: '이미 있는 아이디입니다.',
            })
        }
    } catch (error) {
        console.error(error)
        next(error)
    }
})

// 로그인
// NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
router.post('/login', async (req, res, next) => {
    try {
        const { user_id, password } = req.body

        const user = await User.findOne({ user_id })

        if (!user) {
            return res.status(400).send('아이디가 존재하지 않습니다.')
        }

        const passwordCheck = await bcrypt.compare(password, user.password)

        if (!passwordCheck) {
            return res.status(400).send('비밀번호가 일치하지 않습니다.')
        }

        const token = jwt.sign({ user_id: user.user_id }, 'my-secret-key')

        res.send({
            user,
            token,
            msg: '로그인 완료!',
        })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

// 사용자 인증(로그인 상태를 확인해주는 기능)
router.get('/me', authMiddleware, (req, res) => {
    const { user } = res.locals
    res.send({
        user,
    })
})

module.exports = router
