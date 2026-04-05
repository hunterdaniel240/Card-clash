import { io } from "socket.io-client";

// intialize socket client
const socket = io("http://localhost:5000", {
  autoConnect: false,
  auth: (callback) => {
    const user = JSON.parse(localStorage.getItem("user"));
    callback({ userId: user?.id });
  },
});

export default socket;
