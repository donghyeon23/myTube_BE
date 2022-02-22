const mongoose = require('mongoose');
const Comment = require('./comment');
const User = require('./user');
const Like = require('./like');

const postsSchema = new mongoose.Schema(
    {
        channelName: {
            type: String,
            required: true,
        },
        profile: {
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
        imageUrl: {
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
    },
    { timestamps: true },
    { versionKey: false }
);

postsSchema.virtual('postId').get(function () {
    return this._id.toHexString();
});

postsSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId',
});

postsSchema.virtual('commentsCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId',
    count: true,
});

postsSchema.virtual('likes', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'postId',
});

postsSchema.virtual('likesCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'postId',
    count: true,
});

postsSchema.set('toJSON', { virtuals: true });
postsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postsSchema);
