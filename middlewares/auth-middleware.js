const jwt = require('jsonwebtoken')
<<<<<<< HEAD
const { User } = require("../schemas/user");
=======
const { User } = require('../schemas/user')
>>>>>>> a796cfac6de7c94cb7e086d1463bec59646f1066

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    const [tokenType, tokenValue] = authorization.split(' ')

    if (tokenType !== 'Bearer') {
<<<<<<< HEAD
        return res.status(401).send({
            errorMessage: '로그인 후 사용하세요.'
=======
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.',
>>>>>>> a796cfac6de7c94cb7e086d1463bec59646f1066
        })
    }

    try {
        const { user_id } = jwt.verify(tokenValue, 'my-secret-key')

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
