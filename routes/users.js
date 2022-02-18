const express = require("express");
const router = express.Router();
const {User} = require("../schemas/user");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
// const authMiddleware = require('../middlewares/auth-middleware')


//회원가입
router.post("/new", async (req, res) => {
    try {
      const { user_id, userName, password } = req.body;
      const encryptedPassword = bcrypt.hashSync(password, 10)      // password 암호화
      const existsUsers = await User.findOne({ user_id });
      if (existsUsers) {
          // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
          return res.status(400).send({
              errorMessage: "ID가 이미 사용중입니다.",
          });
      }
      await User.create({
        user_id,
        userName,
        password: encryptedPassword,
      })
      res.status(201).json({
        msg: '회원가입 성공'
      });
    } catch (error) {
      res.status(400).json({
        errorMessage: '입력정보를 다시 확인해주세요.'
      })
    };
  });

  // 아이디 중복 체크하기  
router.post('/check', async (req, res, next) => {
    try {
      const { user_id } = req.body
      const user = await User.findOne({ user_id });
        
      if (!user.length) {
        return res.json({
          msg: '가입가능'
        })
      } else {
        return res.json({
          errorMessage: "이미 있는 아이디입니다."
        })
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  })

// 로그인
router.post('/login', async (req, res, next) => {
    try {
      const { user_id, password } = req.body
  
      const user = await User.findOne({ user_id });
  
      if(!user) {
        return res.status(400).send("아이디가 존재하지 않습니다.");
      }
  
      const passwordCheck = await bcrypt.compare(password, user.password)
  
      if(!passwordCheck) {
        return res.status(400).send("비밀번호가 일치하지 않습니다.");
      }

      const token = jwt.sign({ user_id: user.user_id }, 'my-secret-key')
  
      res.send({
        user,
        token,
        msg: '로그인 완료!'
      })
  
    } catch (error) {
      console.error(error);
      next(error);
    }
  })
  
  // 사용자 인증(로그인 상태를 확인해주는 기능)
  router.get('/me', authMiddleware, (req, res) => {
    const { user } = res.locals
    res.send({
      user
    })
  })

module.exports = router;