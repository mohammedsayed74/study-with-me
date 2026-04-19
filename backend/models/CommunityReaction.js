const mongoose = require("mongoose");

const communityReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // This can point to either a Post or a Comment
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only have one reaction per target
communityReactionSchema.index({ user: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model("CommunityReaction", communityReactionSchema);
