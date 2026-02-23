const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const User = require('../models/User');
const { isLoggedIn } = require('../middleware/auth');
const upload = require('../middleware/upload');

const POSTS_PER_PAGE = 4;

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const totalPosts = await Post.countDocuments();
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
        const currentPage = Math.max(1, Math.min(page, totalPages || 1));

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * POSTS_PER_PAGE)
            .limit(POSTS_PER_PAGE)
            .populate('user', 'username');

        res.render('index', {
            title: 'Feed',
            posts,
            currentPage,
            totalPages,
            totalPosts
        });
    } catch (err) {
        req.flash('error', 'Failed to load feed.');
        res.render('index', { title: 'Feed', posts: [], currentPage: 1, totalPages: 1, totalPosts: 0 });
    }
});

router.get('/upload', isLoggedIn, (req, res) => {
    res.render('upload', { title: 'New Post' });
});

router.post('/upload', isLoggedIn, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            req.flash('error', err.message || 'Image upload failed.');
            return res.redirect('/upload');
        }

        try {
            const user = await User.findById(req.user._id);
            if (user.postCount >= 10) {
                if (req.file) fs.unlinkSync(req.file.path);
                req.flash('error', 'You have reached the maximum limit of 10 posts.');
                return res.redirect('/upload');
            }

            if (!req.file) {
                req.flash('error', 'Please select an image to upload.');
                return res.redirect('/upload');
            }

            const { caption } = req.body;
            const imagePath = '/uploads/' + req.file.filename;

            const post = new Post({ caption, imagePath, user: req.user._id });
            await post.save();

            await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

            req.flash('success', 'Post uploaded successfully!');
            res.redirect('/');
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error', 'Failed to create post. Please try again.');
            res.redirect('/upload');
        }
    });
});

router.get('/post/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'username');
        if (!post) {
            req.flash('error', 'Post not found.');
            return res.redirect('/');
        }
        res.render('post', { title: post.caption, post });
    } catch (err) {
        req.flash('error', 'Post not found.');
        res.redirect('/');
    }
});

router.get('/post/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'username');
        if (!post) {
            req.flash('error', 'Post not found.');
            return res.redirect('/');
        }
        if (!post.user._id.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to edit this post.');
            return res.redirect('/');
        }
        res.render('edit', { title: 'Edit Post', post });
    } catch (err) {
        req.flash('error', 'Post not found.');
        res.redirect('/');
    }
});

router.post('/post/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error', 'Post not found.');
            return res.redirect('/');
        }
        if (!post.user.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to edit this post.');
            return res.redirect('/');
        }
        const { caption } = req.body;
        post.caption = caption;
        await post.save();
        req.flash('success', 'Post updated successfully!');
        res.redirect('/post/' + post._id);
    } catch (err) {
        req.flash('error', 'Failed to update post.');
        res.redirect('/');
    }
});

router.post('/post/:id/delete', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            req.flash('error', 'Post not found.');
            return res.redirect('/');
        }
        if (!post.user.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to delete this post.');
            return res.redirect('/');
        }

        const filePath = path.join(__dirname, '..', 'public', post.imagePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Post.findByIdAndDelete(req.params.id);
        await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: -1 } });

        req.flash('success', 'Post deleted successfully.');
        res.redirect('/');
    } catch (err) {
        req.flash('error', 'Failed to delete post.');
        res.redirect('/');
    }
});

module.exports = router;
