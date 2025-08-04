import React, { Component } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

// Helper function to decode JWT and extract payload
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}

class CommentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      newComment: "",
      stompClient: null
    };
  }

  componentDidMount() {
    if (this.props.activeCase?.id) {
      this.connectWebSocket();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.activeCase?.id &&
      prevProps.activeCase?.id !== this.props.activeCase.id
    ) {
      this.disconnectWebSocket();
      this.setState({ comments: [] }, () => {
        this.connectWebSocket();
      });
    }
  }

  componentWillUnmount() {
    this.disconnectWebSocket();
  }

  connectWebSocket = () => {
    const { activeCase } = this.props;
    if (!activeCase?.id) return;

    const socket = new SockJS("http://localhost:9099/ws");
    const stompClient = over(socket);

    stompClient.connect({}, () => {
      console.log("✅ Connected to WebSocket");

      // Subscribe to comments for this case
      stompClient.subscribe(
        `/topic/comments/${activeCase.id}`,
        (message) => {
          if (message.body) {
            const comment = JSON.parse(message.body);
            this.setState((prev) => ({
              comments: [...prev.comments, comment]
            }));
          }
        }
      );

      // Load existing comments from REST API
      fetch(`http://localhost:9099/api/comments/${activeCase.id}`)
        .then((res) => res.json())
        .then((data) => this.setState({ comments: data }))
        .catch((err) => console.error("❌ Failed to fetch comments", err));
    });

    this.setState({ stompClient });
  };

  disconnectWebSocket = () => {
    if (this.state.stompClient) {
      this.state.stompClient.disconnect(() => {
        console.log("🔌 WebSocket Disconnected");
      });
      this.setState({ stompClient: null });
    }
  };

  sendComment = () => {
    const { newComment, stompClient } = this.state;
    const { activeCase } = this.props;

    if (!newComment.trim()) return;

    if (!stompClient || !stompClient.connected) {
      console.warn("⚠ WebSocket is not connected.");
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    const decoded = token ? parseJwt(token) : null;
    const loggedInUser = decoded?.sub || "Anonymous";

    const commentObj = {
      caseId: activeCase.id.toString(),
      message: newComment,
      Username: loggedInUser
    };

    stompClient.send(
      `/app/chat.message/${activeCase.id}`,
      {},
      JSON.stringify(commentObj)
    );

    this.setState({ newComment: "" });
  };

  render() {
    const { show, onHide, activeCase } = this.props;
    const { comments, newComment } = this.state;

    if (!show) return null;

    return (
      <div className="modal show fade" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Comments for Case {activeCase?.caseNumber || "N/A"}</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {comments.length > 0 ? (
                comments.map((c, index) => (
                  <div key={index} className="border p-2 mb-2 rounded">
                    <strong>{c.Username || "User"}:</strong>
                    <p>{c.message || c.comment}</p>
                  </div>
                ))
              ) : (
                <p>No comments available</p>
              )}
            </div>
            <div className="modal-footer">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => this.setState({ newComment: e.target.value })}
              />
              <button className="btn btn-primary" onClick={this.sendComment}>
                Send
              </button>
              <button className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CommentModal;
