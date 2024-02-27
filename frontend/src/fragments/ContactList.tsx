import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import useData from "../context/Data";
import { MenuItem } from "@mui/material";
import React, { useMemo } from "react";
import MenuIcon from "@mui/icons-material/Menu";

function ProfileOptions() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { profile, clearIdentity, clearName } = useData();
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleChangeName = () => {
    clearName();
    handleClose();
  };

  const handleNewId = () => {
    clearIdentity();
    handleClose();
  };

  return (
    <>
      <ListItemButton onClick={handleClick} ref={anchorRef}>
        <ListItemText
          sx={{ textAlign: "center" }}
          primary={`${profile?.name} (you)`}
          secondary="Edit"
        />
      </ListItemButton>

      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem>{profile?.salt}</MenuItem>
        <MenuItem>{profile?.conId}</MenuItem>
        <MenuItem onClick={handleChangeName}>Change Name</MenuItem>
        <MenuItem onClick={handleNewId}>New Identity</MenuItem>
      </Menu>
    </>
  );
}

interface ContactListContainerProps {
  children: React.ReactNode;
}
function ContactListContainer({ children }: ContactListContainerProps) {
  const { unseenChats } = useData();
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const isBig = useMediaQuery("(min-width:800px)");

  if (isBig)
    return (
      <Box component={Paper} elevation={2} width={"300px"}>
        <ProfileOptions />
        <Divider />
        {children}
      </Box>
    );

  return (
    <Box sx={{ position: "absolute" }}>
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          height: "64px",
          width: "64px",
          animation: unseenChats.length ? "flash 2s infinite" : "",
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: "300px" }}
          role="presentation"
          onClick={(e) => {
            if ((e?.target as any)?.className.includes("closeMenu")) {
              setOpen(false);
            }
          }}
        >
          <ProfileOptions />
          <Divider />
          {children}
        </Box>
      </Drawer>
    </Box>
  );
}

interface ContactRowProps {
  chatId: string;
}
function ContactRow({ chatId }: ContactRowProps) {
  const { setCurrentWindow, currentWindow, chatData, profile, unseenChats } =
    useData();
  return (
    <ListItemButton
      onClick={() => setCurrentWindow(chatId)}
      sx={{
        backgroundColor: currentWindow === chatId ? "lightgray" : "",
        animation: unseenChats.includes(chatId) ? "flash 2s infinite" : "",
      }}
      className={"closeMenu"}
    >
      <ListItemText
        primary={`${chatData[chatId].user.name}`}
        secondary={(chatData[chatId].status === "off"
          ? "OFLINE"
          : chatData[chatId].messages[chatData[chatId].messages.length - 1]
              ?.text ?? ""
        ).substring(0, 15)}
        sx={{ pointerEvents: "none" }}
      />
    </ListItemButton>
  );
}

function ContactList() {
  const { chatData, profile } = useData();

  const contactsKeys = useMemo(() => {
    return [
      "public",
      ...Object.keys(chatData).filter(
        (k) => k !== "public" && k !== profile?.salt
      ),
    ];
  }, [chatData, profile?.salt]);

  const onlineCount = useMemo(() => {
    const keys = Object.keys(chatData);
    const on = keys.filter(
      (k) =>
        chatData[k].status === "on" && k !== "public" && k !== profile?.salt
    );
    return on.length;
  }, [chatData, profile]);

  const onlineList = useMemo(() => {
    return contactsKeys.filter((ck) => chatData[ck].status === "on");
  }, [chatData, contactsKeys]);
  const offlineList = useMemo(() => {
    return contactsKeys.filter((ck) => chatData[ck].status === "off");
  }, [chatData, contactsKeys]);

  return (
    <ContactListContainer>
      <Typography gutterBottom align="center">
        Users Online: {onlineCount}
      </Typography>
      <List sx={{ width: "100%" }}>
        {onlineList.map((key) => (
          <ContactRow chatId={key} key={key} />
        ))}
        {offlineList.length > 0 && (
          <>
            <Divider sx={{ margin: 2 }} />
            <Typography align="center">Offline</Typography>
            {offlineList.map((key) => (
              <ContactRow chatId={key} key={key} />
            ))}
          </>
        )}
      </List>
    </ContactListContainer>
  );
}

export default ContactList;
