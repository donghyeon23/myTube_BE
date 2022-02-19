const mongoose = require('mongoose')
const Comment = require('./comment')
const Post = require('./post')

const UserSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    channelName: { type: String, required: true },
    password: { type: String, required: true },
    profile: { type: String, required: true },
},
    { timestamps: true },
    { versionKey: false },
)

UserSchema.virtual('userId').get(function () {
    return this._id.toHexString()
})

UserSchema.set('toJSON', { virtuals: true })
UserSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('User', UserSchema)
