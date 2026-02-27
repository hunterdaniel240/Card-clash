import { io } from "socket.io-client";

// intialize socket client
export default io("http://localhost:5000");
