const CommunityPost = require("../models/CommunityPost");
const CommunityComment = require("../models/CommunityComment");
const CommunityReaction = require("../models/CommunityReaction");
const mongoose = require("mongoose");

// --- Post Controllers ---

const getPosts = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    const posts = await CommunityPost.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("author", "name role")
      .lean();

    // If user is logged in, attach their reaction
    if (userId) {
      const postIds = posts.map(p => p._id);
      const reactions = await CommunityReaction.find({
        user: userId,
        targetId: { $in: postIds },
        targetType: "Post"
      }).lean();

      posts.forEach(post => {
        const reaction = reactions.find(r => r.targetId.toString() === post._id.toString());
        post.userReaction = reaction ? reaction.type : null;
      });
    }

    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await CommunityPost.create({
      content,
      author: req.user._id,
      imageUrl: req.file ? req.file.path : null,
      imagePublicId: req.file ? req.file.filename : null
    });

    const populatedPost = await CommunityPost.findById(post._id).populate("author", "name role").lean();

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await CommunityPost.findOne({ _id: id, isDeleted: false });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.content = content;
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.isDeleted = true;
    await post.save();

    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Comment Controllers ---

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    const comments = await CommunityComment.find({ post: postId, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate("author", "name role")
      .lean();

    if (userId) {
      const commentIds = comments.map(c => c._id);
      const reactions = await CommunityReaction.find({
        user: userId,
        targetId: { $in: commentIds },
        targetType: "Comment"
      }).lean();

      comments.forEach(comment => {
        const reaction = reactions.find(r => r.targetId.toString() === comment._id.toString());
        comment.userReaction = reaction ? reaction.type : null;
      });
    }

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await CommunityComment.create({
      content,
      author: req.user._id,
      post: postId,
      parentComment: parentCommentId || null
    });

    await CommunityPost.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populatedComment = await CommunityComment.findById(comment._id).populate("author", "name role").lean();

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await CommunityComment.findOne({ _id: id, isDeleted: false });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommunityComment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.isDeleted = true;
    await comment.save();

    await CommunityPost.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Reaction Controllers ---

const reactToTarget = async (req, res) => {
  try {
    const { targetId, targetType, type } = req.body; // targetType: "Post" or "Comment", type: "like" or "dislike"
    const userId = req.user._id;

    if (!["Post", "Comment"].includes(targetType) || !["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Invalid target type or reaction type" });
    }

    // Check if reaction already exists
    const existingReaction = await CommunityReaction.findOne({ user: userId, targetId });

    const Model = targetType === "Post" ? CommunityPost : CommunityComment;

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction (toggle off)
        await CommunityReaction.findByIdAndDelete(existingReaction._id);
        const update = type === "like" ? { $inc: { likesCount: -1 } } : { $inc: { dislikesCount: -1 } };
        await Model.findByIdAndUpdate(targetId, update);
        return res.status(200).json({ success: true, message: "Reaction removed", userReaction: null });
      } else {
        // Change reaction type
        const oldType = existingReaction.type;
        existingReaction.type = type;
        await existingReaction.save();

        const update = type === "like" 
          ? { $inc: { likesCount: 1, dislikesCount: -1 } } 
          : { $inc: { likesCount: -1, dislikesCount: 1 } };
        
        await Model.findByIdAndUpdate(targetId, update);
        return res.status(200).json({ success: true, message: "Reaction updated", userReaction: type });
      }
    } else {
      // Create new reaction
      await CommunityReaction.create({ user: userId, targetId, targetType, type });
      const update = type === "like" ? { $inc: { likesCount: 1 } } : { $inc: { dislikesCount: 1 } };
      await Model.findByIdAndUpdate(targetId, update);
      return res.status(201).json({ success: true, message: "Reaction added", userReaction: type });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  reactToTarget
};
