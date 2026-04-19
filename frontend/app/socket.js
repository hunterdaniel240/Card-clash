import { io } from "socket.io-client";
const server_url =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_SERVER_URL
    : process.env.NEXT_PUBLIC_DEV_SERVER_URL;

// intialize socket client
const socket = io(server_url, {
  autoConnect: false,
  auth: (callback) => {
    const user = JSON.parse(localStorage.getItem("user"));
    callback({ userId: user?.id });
  },
});

export default socket;
