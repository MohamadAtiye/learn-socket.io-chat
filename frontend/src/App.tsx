import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Paper } from "@mui/material";
import ContactList from "./fragments/ContactList";
import ChatScreen from "./fragments/ChatScreen";
import useData from "./context/Data";
import NameDialog from "./fragments/NameDialog";

function Header() {
  const { isConnected } = useData();
  return (
    <Typography variant="h4" component="h1" sx={{ mb: 2, textAlign: "center" }}>
      Web Chat and Call {!isConnected && "(disconnected)"}
    </Typography>
  );
}

function Copyright() {
  return (
    <Box p={2}>
      <Typography variant="body2" color="text.secondary" align="center">
        {"Copyright © "}
        <Link color="inherit" href="https://atiyeru/">
          Atiye.ru
        </Link>{" "}
        {new Date().getFullYear()}.
      </Typography>
    </Box>
  );
}

function Conversation() {
  return (
    <Box sx={{ flex: 1 }} component={Paper} elevation={2}>
      <ChatScreen />
    </Box>
  );
}

function App() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          padding: "8px 0",
        }}
      >
        <ContactList />
        <Conversation />
      </Container>
      <Copyright />
      <NameDialog />
    </Box>
  );
}

export default App;
