const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: [true, 'Caption is required'],
        trim: true,
        maxlength: [300, 'Caption cannot exceed 300 characters']
    },
    imagePath: {
        type: String,
        required: [true, 'Image is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
