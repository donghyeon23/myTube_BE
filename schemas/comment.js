const mongoose = require('mongoose');
const Post = require('./post');
const User = require('./user');

const CommentSchema = new mongoose.Schema(
    {
        channelName: { type: String, required: true },
        profile: { type: String, required: true },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
        comment: { type: String, required: true },
    },
    { timestamps: true },
    { versionKey: false }
);

CommentSchema.virtual('commentId').get(function () {
    return this._id.toHexString();
});

CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);
