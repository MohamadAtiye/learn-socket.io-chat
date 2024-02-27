import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import cors from "cors"; // Import the cors package
import base64id from "base64id";
import { Message, SelfData, ToSendMessage } from "./types";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, TEXT_MAX_LENGTH } from "./contants";
import escapeHtml from "escape-html";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow requests from any domain
  },
});

type Profile = {
  name: string;
  conId: string;
  socket: Socket;
  status: "on" | "off";
  salt: string;
};
let activeSockets: Profile[] = [];

function broadcastUsers() {
  io.emit(
    "users",
    activeSockets
      .filter((s) => s.status === "on")
      .map((s) => ({ id: s.salt, name: s.name }))
  );
}

function updateUserProfle(
  name: string,
  conId: string,
  salt: string,
  socket: Socket
) {
  const oldProfile = activeSockets.find(
    (a) => a.conId === conId && a.salt === salt
  );
  if (!oldProfile) {
    salt = salt && salt.length > 15 ? escapeHtml(salt) : base64id.generateId();
    conId = escapeHtml(conId);

    console.log("creating new profile with ", name, salt);
    return createUserProfle(name, salt, socket);
  }

  oldProfile.name = name;
  oldProfile.conId = socket.id;
  oldProfile.status = "on";
  oldProfile.salt = salt;
  oldProfile.socket = socket;

  return oldProfile;
}
function createUserProfle(name: string, salt: string, socket: Socket) {
  const profile: Profile = {
    name,
    conId: socket.id,
    status: "on",
    salt: salt,
    socket,
  };
  activeSockets.push(profile);
  return profile;
}

io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  // mark user status as "off"
  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
    const s = activeSockets.find((a) => a.conId === socket.id);
    if (s && s.status) s.status = "off";
    broadcastUsers();
  });

  // handle name change
  socket.on("changeName", (name: string, cb: (d: SelfData) => void) => {
    console.log("changeName ", JSON.stringify(name));

    name = escapeHtml(name.trim());
    if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) return;

    const p = activeSockets.find((a) => a.conId === socket.id);
    if (!p) {
      cb && cb(undefined);
      return;
    }

    // name change
    p.name = name;

    const selfData: SelfData = { name: p.name, conId: socket.id, salt: p.salt };
    cb && cb(selfData);

    broadcastUsers();
  });

  // for new users or profile reset
  socket.on("profile", (selfData: SelfData, cb: (d: SelfData) => void) => {
    console.log("profile", selfData);

    // sanitize data
    // check name length
    selfData.name = escapeHtml(selfData.name);
    if (
      selfData.name.length < NAME_MIN_LENGTH ||
      selfData.name.length > NAME_MAX_LENGTH
    )
      return;

    const profile = updateUserProfle(
      selfData.name,
      selfData.conId,
      selfData.salt,
      socket
    );

    cb && cb({ conId: profile.conId, salt: profile.salt, name: profile.name });

    broadcastUsers();
  });

  socket.on("send", (m: ToSendMessage, cb) => {
    const text = m.text;
    if (text.length < 1 || text.length > TEXT_MAX_LENGTH) return;

    //if public, send to all
    if (m.toId === "public") {
      const message: Message = {
        ...m,
        ts: Date.now(),
      };
      io.emit("send", message);
    }
    // else send to user
    else {
      const so = activeSockets.find((s) => s.salt === m.toId);
      if (!so) {
        console.log("not found user", m.toId);
        return;
      }
      const message: Message = {
        ...m,
        ts: Date.now(),
      };
      so.socket.emit("send", message);
      cb && cb(message);
    }
  });
});

httpServer.listen(3001);
