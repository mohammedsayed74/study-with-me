const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const upload = require("../middleware/communityUploadMiddleware");
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  reactToTarget
} = require("../controllers/communityControllers");

// Public routes (though mostly we want them behind auth in a dashboard context)
// But we use requireAuth for almost everything here to get user info

router.use(requireAuth);

router.get("/posts", getPosts);
router.post("/posts", upload.single("image"), createPost);
router.patch("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", createComment);
router.patch("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

router.post("/react", reactToTarget);

module.exports = router;
