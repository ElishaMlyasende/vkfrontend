// CommentModal.js
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const CommentModal = ({ show, onClose, caseId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (show && caseId) fetchComments();
  }, [show, caseId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://13.48.138.226:9099/comment/${caseId}`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(Array.isArray(data) ? data : [data]);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleSave = async () => {
    if (!commentText.trim()) {
      Swal.fire("Warning", "Please write a comment", "warning");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://13.48.138.226:9099/comment/add/${caseId}`
      : `http://13.48.138.226:9099/comment/add/${caseId}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, message: commentText }),
      });

      if (!res.ok) throw new Error("Failed to save comment");
      await Swal.fire("Success", `Comment ${editId ? "updated" : "added"}`, "success");
      setCommentText("");
      setEditId(null);
      fetchComments();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Comment?",
      text: "This action is irreversible",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://13.48.138.226:9099/comment/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      Swal.fire("Deleted", "Comment deleted", "success");
      fetchComments();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = (comment) => {
    setEditId(comment.id);
    setCommentText(comment.message);
  };

  if (!show) return null;

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Comments for Case ID: {caseId}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn btn-primary me-2" onClick={handleSave}>
              {editId ? "Update Comment" : "Add Comment"}
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setEditId(null);
              setCommentText("");
            }}>
              Clear
            </button>

            <hr />
            <ul className="list-group">
              {comments.map((c) => (
                <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{c.message}</span>
                  <div>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(c)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
