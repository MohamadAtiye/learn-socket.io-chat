import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import React, { KeyboardEvent, useEffect, useRef } from "react";
import useData from "../context/Data";
import { Message } from "../utils/types";
import { getFormatedTime } from "../utils/utils";
import { TEXT_MAX_LENGTH } from "../utils/contants";

interface DisplayMessageProps {
  message: Message;
}
function DisplayMessage({ message }: DisplayMessageProps) {
  const { profile } = useData();

  return (
    <Box
      alignSelf={message.fromId === profile?.salt ? "flex-start" : "flex-end"}
      mb={2}
      display={"flex"}
      flexDirection={"column"}
    >
      <Typography
        variant="caption"
        alignSelf={message.fromId === profile?.salt ? "flex-start" : "flex-end"}
      >
        {message.senderName} {message.fromId === profile?.salt ? "(me)" : ""},{" "}
        {getFormatedTime(message.ts)}
      </Typography>
      <Typography variant="body1">{message.text}</Typography>
    </Box>
  );
}

const ChatScreen: React.FC = () => {
  const { currentWindow, sendMassage, chatData, unseenChats } = useData();
  const [input, setInput] = React.useState("");
  const thisChat = chatData[currentWindow];

  const inputRef = useRef<HTMLDivElement>(null);

  const focusOnTextField = () => {
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    const anchor = document.querySelector("#scroll-bottom-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const scrollToBottomInstant = () => {
    const anchor = document.querySelector("#scroll-bottom-anchor");
    if (anchor) {
      anchor.scrollIntoView({ block: "center" });
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleSend = () => {
    if (thisChat.status === "off") return;

    const text = input.trim();
    if (text.length < 1 || text.length > TEXT_MAX_LENGTH) return;

    // Handle sending the message
    sendMassage(text, () => {
      focusOnTextField();
      scrollToBottom();
    });
    setInput("");
  };

  useEffect(() => {
    if (unseenChats.includes(currentWindow)) scrollToBottom();
  }, [currentWindow, unseenChats]);

  useEffect(() => {
    focusOnTextField();
    scrollToBottomInstant();
  }, [currentWindow]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box padding={2} height={"72px"}>
        <Typography gutterBottom align="center">
          {currentWindow === "public"
            ? "Public Chat"
            : `Chat with ${thisChat.user.name}`}
        </Typography>
      </Box>
      <Divider />
      <Box
        flexGrow={1}
        overflow="auto"
        p={2}
        display={"flex"}
        flexDirection={"column"}
      >
        {thisChat.messages.map((message) => (
          <DisplayMessage key={message.ts} message={message} />
        ))}
        <span id="scroll-bottom-anchor"></span>
      </Box>
      <Box display="flex">
        <TextField
          variant="outlined"
          placeholder="Type a message"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={thisChat.status === "off"}
          inputProps={{
            maxLength: TEXT_MAX_LENGTH,
          }}
          inputRef={inputRef}
          onKeyPress={handleKeyPress}
          autoComplete="password2"
        />
        <Button
          color="primary"
          variant="contained"
          onClick={handleSend}
          disabled={thisChat.status === "off"}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatScreen;
