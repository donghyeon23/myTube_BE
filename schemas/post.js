const mongoose = require('mongoose')
const Comment = require('./comment')
const User = require('./user')

const postsSchema = new mongoose.Schema(
    {
        channelName: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
)

postsSchema.virtual('postId').get(function () {
    return this._id.toHexString()
})

postsSchema.set('toJSON', { virtuals: true })
postsSchema.set('toObject', { virtuals: true })

// postsSchema.post('save',
//   async function (next) {
//     // post id
//     const { channelName, _id } = this.getFilter();
//     // 관련 댓글 삭제
//     await User.mupdate({ _id : channelName }, {$push: {posts: _id} });

//     next();
// });

module.exports = mongoose.model('Post', postsSchema)
