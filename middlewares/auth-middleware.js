const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const { JWT_SECRET_KEY } = process.env;

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    const [tokenType, tokenValue] = authorization.split(' ')

    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.',
        })
    }

    try {
        const { user_id } = jwt.verify(tokenValue, JWT_SECRET_KEY)

        User.findOne({ user_id }).then((user) => {
            res.locals.user = user
            next()
        })
    } catch (err) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.',
        })
    }
}
