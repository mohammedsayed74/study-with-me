import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./community.css";

const AVATAR_COLORS = [
  "#2b8cee", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#6366f1", "#14b8a6", "#f97316",
];

function CommunityView() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Latest");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
    fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/community/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data.data);
    } catch (err) {
      setError("Failed to load community feed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const tabs = ["Latest", "My Posts"];

  const filteredPosts = posts.filter(post => {
    if (activeTab === "My Posts") {
      return post.author?._id === user?._id;
    }
    return true; // "Latest" shows all
  });

  return (
    <div className="community-wrapper">
      {/* Premium Page Header */}
      <header className="comm-header">
        <div className="comm-header-text">
          <h2>Community Hub</h2>
          <p>Connect, share, and grow with your fellow scholars.</p>
        </div>
        <div className="comm-stats-mini">
          <div className="comm-stat-item">
            <span className="comm-stat-value">{posts.length}</span>
            <span className="comm-stat-label">Total Posts</span>
          </div>
          <div className="comm-stat-item">
            <span className="comm-stat-value">12</span>
            <span className="comm-stat-label">Active Now</span>
          </div>
        </div>
      </header>

      {/* Toolbar: Filters & Search */}
      <div className="comm-toolbar">
        <div className="comm-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`comm-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="comm-search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search discussions..." />
        </div>
      </div>

      <CreatePost user={user} token={token} onCreated={handlePostCreated} />
      
      {loading && posts.length === 0 ? (
        <div className="posts-loading">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : error ? (
        <div className="community-error">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="comm-empty-state">
          <div className="comm-empty-illustration">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <h3>The hub is quiet...</h3>
          <p>{activeTab === "My Posts" ? "You haven't posted anything yet." : "Be the first to spark a conversation in the community!"}</p>
        </div>
      ) : (
        <div className="posts-feed">
          {filteredPosts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              currentUser={user} 
              token={token} 
              onDelete={handlePostDeleted} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Create Post Component ---
function CreatePost({ user, token, onCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const res = await axios.post("/api/community/posts", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setContent("");
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onCreated(res.data.data);
    } catch (err) {
      alert("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "?";
  const avatarColor = AVATAR_COLORS[userInitial.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="comm-create-card">
      <div className="comm-create-upper">
        <div className="comm-avatar" style={{ background: avatarColor }}>{userInitial}</div>
        <div className="comm-create-input-wrap">
          <textarea 
            className="comm-create-textarea"
            placeholder="Share an insight or ask a question..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
          {preview && (
            <div className="image-preview-container">
              <img src={preview} alt="Preview" />
              <button className="remove-image-btn" onClick={removeImage}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="comm-create-footer">
        <div className="comm-create-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            style={{ display: "none" }} 
          />
          <button 
            className="comm-action-btn" 
            onClick={() => fileInputRef.current.click()} 
            title="Upload Image"
          >
            <span className="material-symbols-outlined">upload_file</span>
          </button>
        </div>
        <button 
          className="comm-post-btn" 
          onClick={handleSubmit} 
          disabled={(!content.trim() && !image) || submitting}
        >
          {submitting ? "Posting..." : "Post Discussion"}
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}

// --- Post Card Component ---
function PostCard({ post: initialPost, currentUser, token, onDelete }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(initialPost.content);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdate = async () => {
    try {
      await axios.patch(`/api/community/posts/${post._id}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost({ ...post, content: editContent });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update post");
    }
  };

  const handleReact = async (type) => {
    try {
      const res = await axios.post("/api/community/react", {
        targetId: post._id,
        targetType: "Post",
        type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPost(prev => {
        const newPost = { ...prev };
        const oldReaction = prev.userReaction;
        const newReaction = res.data.userReaction;

        if (oldReaction === "like") newPost.likesCount--;
        if (oldReaction === "dislike") newPost.dislikesCount--;
        
        if (newReaction === "like") newPost.likesCount++;
        if (newReaction === "dislike") newPost.dislikesCount++;

        newPost.userReaction = newReaction;
        return newPost;
      });
    } catch (err) {
      console.error("Reaction error", err);
    }
  };

  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      fetchComments();
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`/api/community/posts/${post._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data.data);
    } catch (err) {
      console.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`/api/community/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(post._id);
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const userInitial = post.author?.name?.charAt(0)?.toUpperCase() || "?";
  const avatarColor = AVATAR_COLORS[userInitial.charCodeAt(0) % AVATAR_COLORS.length];
  const canEdit = currentUser?._id === post.author?._id;
  const canDelete = currentUser?._id === post.author?._id || currentUser?.role === "teacher";
  const isTeacher = post.author?.role === "teacher";

  return (
    <div className="comm-post-card">
      <div className="comm-post-header">
        <div className="comm-post-author">
          <div className="comm-avatar" style={{ background: avatarColor }}>{userInitial}</div>
          <div className="comm-author-meta">
            <span className="comm-author-name">
              {post.author?.name}
              <span className={`comm-role-badge ${isTeacher ? 'teacher' : 'student'}`}>
                {post.author?.role}
              </span>
            </span>
            <span className="comm-post-time">
              <span className="material-symbols-outlined" style={{fontSize: '14px'}}>schedule</span>
              {formatTime(post.createdAt)}
            </span>
          </div>
        </div>
        
        {canDelete && (
          <div className="comm-dropdown" ref={menuRef}>
            <button className="comm-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
            {showMenu && (
              <div className="comm-menu-dropdown">
                {canEdit && (
                  <button className="comm-menu-item" onClick={() => { setShowMenu(false); setIsEditing(true); }}>
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span> Edit Post
                  </button>
                )}
                <button className="comm-menu-item danger" onClick={handleDelete}>
                  <span className="material-symbols-outlined" style={{fontSize: '18px'}}>delete</span> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="comm-post-body">
        {isEditing ? (
          <div className="edit-post-wrap">
            <textarea 
              className="comm-create-textarea" 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              style={{ background: 'var(--dash-bg)', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="comm-post-btn" onClick={handleUpdate} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Save</button>
              <button className="comm-post-btn" style={{ background: 'var(--dash-text-muted)', padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          post.content
        )}
      </div>

      {post.imageUrl && (
        <div className="comm-post-image">
          <img src={post.imageUrl} alt="Post content" />
        </div>
      )}

      <div className="comm-post-footer">
        <div className="comm-post-stats">
          <button 
            className={`comm-stat-btn ${post.userReaction === "like" ? "active-like" : ""}`}
            onClick={() => handleReact("like")}
          >
            <span className="material-symbols-outlined">thumb_up</span>
            {post.likesCount}
          </button>
          <button 
            className={`comm-stat-btn ${post.userReaction === "dislike" ? "active-dislike" : ""}`}
            onClick={() => handleReact("dislike")}
          >
            <span className="material-symbols-outlined">thumb_down</span>
            {post.dislikesCount}
          </button>
          <button className="comm-stat-btn" onClick={toggleComments}>
            <span className="material-symbols-outlined">comment</span>
            {post.commentsCount}
          </button>
        </div>
        <button className="comm-menu-btn" title="Share Discussion">
          <span className="material-symbols-outlined">share</span>
        </button>
      </div>

      {showComments && (
        <div className="comm-comments-area">
          <CommentInput 
            postId={post._id} 
            token={token} 
            user={currentUser} 
            onCommented={(newComment) => {
              setComments([...comments, newComment]);
              setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
            }} 
          />
          {loadingComments ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
              Syncing discussions...
            </div>
          ) : (
            <div className="comm-comments-list">
              {comments.filter(c => !c.parentComment).map(comment => (
                <CommentItem 
                  key={comment._id} 
                  comment={comment} 
                  replies={comments.filter(r => r.parentComment === comment._id)}
                  token={token}
                  currentUser={currentUser}
                  onReact={(updatedComment) => {
                    setComments(comments.map(c => c._id === updatedComment._id ? updatedComment : c));
                  }}
                  onReply={(newReply) => {
                    setComments([...comments, newReply]);
                    setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
                  }}
                  onDelete={(commentId) => {
                    setComments(comments.filter(c => c._id !== commentId && c.parentComment !== commentId));
                    setPost(prev => ({ ...prev, commentsCount: prev.commentsCount - 1 }));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Comment Item Component ---
function CommentItem({ comment, replies, token, currentUser, onReact, onReply, onDelete }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleReact = async (type) => {
    try {
      const res = await axios.post("/api/community/react", {
        targetId: comment._id,
        targetType: "Comment",
        type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedComment = { ...comment };
      const oldReaction = comment.userReaction;
      const newReaction = res.data.userReaction;

      if (oldReaction === "like") updatedComment.likesCount--;
      if (oldReaction === "dislike") updatedComment.dislikesCount--;
      
      if (newReaction === "like") updatedComment.likesCount++;
      if (newReaction === "dislike") updatedComment.dislikesCount++;

      updatedComment.userReaction = newReaction;
      onReact(updatedComment);
    } catch (err) {
      console.error("Comment reaction error", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(`/api/community/comments/${comment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(comment._id);
    } catch (err) {
      alert("Failed to delete comment");
    }
  };

  const userInitial = comment.author?.name?.charAt(0)?.toUpperCase() || "?";
  const avatarColor = AVATAR_COLORS[userInitial.charCodeAt(0) % AVATAR_COLORS.length];
  const canDelete = currentUser?._id === comment.author?._id || currentUser?.role === "teacher";

  return (
    <div className="comm-comment-item">
      <div className="comm-comment-main">
        <div className="comm-avatar" style={{ width: "36px", height: "36px", fontSize: "0.85rem", background: avatarColor }}>{userInitial}</div>
        <div className="comm-comment-bubble">
          <div className="comm-comment-author-row">
            <span className="comm-comment-author-name">{comment.author?.name}</span>
            <span className="comm-comment-time">{formatTime(comment.createdAt)}</span>
          </div>
          <div className="comm-comment-text">{comment.content}</div>
          
          {canDelete && (
            <div className="comm-dropdown" ref={menuRef} style={{ position: 'absolute', right: '12px', top: '12px' }}>
              <button className="comm-menu-btn" style={{ width: '24px', height: '24px' }} onClick={() => setShowMenu(!showMenu)}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>more_vert</span>
              </button>
              {showMenu && (
                <div className="comm-menu-dropdown">
                  <button className="comm-menu-item danger" onClick={handleDelete}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="comm-comment-actions">
        <button className={`comm-comment-action ${comment.userReaction === "like" ? "active-like" : ""}`} onClick={() => handleReact("like")}>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>thumb_up</span>
          {comment.likesCount || 0}
        </button>
        <button className={`comm-comment-action ${comment.userReaction === "dislike" ? "active-dislike" : ""}`} onClick={() => handleReact("dislike")}>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>thumb_down</span>
          {comment.dislikesCount || 0}
        </button>
        <button className="comm-comment-action" onClick={() => setShowReplyInput(!showReplyInput)}>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>reply</span>
          Reply
        </button>
      </div>

      {showReplyInput && (
        <div style={{ marginLeft: "48px", marginTop: "12px" }}>
          <CommentInput 
            postId={comment.post} 
            parentCommentId={comment._id} 
            token={token} 
            user={currentUser}
            onCommented={(newReply) => {
              onReply(newReply);
              setShowReplyInput(false);
            }} 
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="comm-replies-container">
          {replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              replies={[]} 
              token={token}
              currentUser={currentUser}
              onReact={onReact}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Comment Input Component ---
function CommentInput({ postId, parentCommentId, token, user, onCommented }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!content.trim()) return;
      setSubmitting(true);
      try {
        const res = await axios.post(`/api/community/posts/${postId}/comments`, { 
          content, 
          parentCommentId 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContent("");
        onCommented(res.data.data);
      } catch (err) {
        alert("Failed to post comment");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "?";
  const avatarColor = AVATAR_COLORS[userInitial.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="comm-comment-input-box">
      <div className="comm-avatar" style={{ width: "36px", height: "36px", fontSize: "0.85rem", background: avatarColor }}>{userInitial}</div>
      <textarea 
        placeholder={parentCommentId ? "Write a reply..." : "Add to the discussion... (Enter to post)"} 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleSubmit}
        disabled={submitting}
        rows={1}
      />
    </div>
  );
}

// --- Helper Components & Functions ---
function PostSkeleton() {
  return (
    <div className="comm-post-card" style={{ padding: '24px', opacity: 0.6 }}>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eee' }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ width: '30%', height: '14px', background: '#eee', marginBottom: '8px', borderRadius: '4px' }}></div>
          <div style={{ width: '15%', height: '10px', background: '#eee', borderRadius: '4px' }}></div>
        </div>
      </div>
      <div style={{ width: '100%', height: '12px', background: '#eee', marginBottom: '10px', borderRadius: '4px' }}></div>
      <div style={{ width: '80%', height: '12px', background: '#eee', borderRadius: '4px' }}></div>
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default CommunityView;
