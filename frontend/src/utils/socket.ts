// src/socket.js
import { io } from "socket.io-client";
import { SOCKET_URL } from "./contants";

// Initialize the socket
export const socket = io(SOCKET_URL, { autoConnect: false });
