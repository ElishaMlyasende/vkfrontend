import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {
  const socket = new SockJS("http://localhost:9099/ws");
  stompClient = Stomp.over(socket);
  
  stompClient.connect({}, () => {
    console.log("Connected to WebSocket");
    stompClient.subscribe("/topic/public", (message) => {
      if (message.body) {
        onMessageReceived(JSON.parse(message.body));
      }
    });
  });
};

export const sendComment = (comment) => {
  if (stompClient && stompClient.connected) {
    stompClient.send("/app/chat.message", {}, JSON.stringify(comment));
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect();
    console.log("Disconnected from WebSocket");
  }
};
