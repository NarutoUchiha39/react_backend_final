import { io } from "socket.io-client"
const Socket = io("http://localhost:4001")
export default Socket