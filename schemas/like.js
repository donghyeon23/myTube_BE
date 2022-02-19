const mongoose = require('mongoose')
const Post = require('./post')

const LikeSchema = new mongoose.Schema(
    {
        channelName: { type: String, required: true },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    },
    { timestamps: true },
    { versionKey: false },
)

CommentSchema.set('toJSON', {
    virtuals: true,
})

CommentSchema.virtual('likeId').get(function () {
    return this._id.toHexString()
})

CommentSchema.set('toJSON', { virtuals: true })
CommentSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Like', LikeSchema)
