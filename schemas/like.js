const mongoose = require('mongoose');
const Post = require('./post');

const LikeSchema = new mongoose.Schema(
    {
        channelName: { type: String, required: true },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    },
    { timestamps: true },
    { versionKey: false }
);

module.exports = mongoose.model('Like', LikeSchema);
