const mongoose = require('mongoose')
const { mongodbUrl } = process.env

const connect = () => {
    mongoose
        .connect(
            'mongodb://test1:test1234@54.180.137.157:27017/test01?authSource=admin',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                ignoreUndefined: true,
            }
        )
        .then(() => console.log('MongoDB Connected', new Date()))
        .catch((err) => console.log(err))
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB Connection Error', err)
})

module.exports = connect
