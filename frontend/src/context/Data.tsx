import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import {
  ChatData,
  Message,
  SelfData,
  ToSendMessage,
  User,
} from "../utils/types";
import { socket } from "../utils/socket";
import { clearProfile, loadProfile, saveProfile } from "../utils/localstorage";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  TEXT_MAX_LENGTH,
} from "../utils/contants";
// import { getChatId } from "../utils/utils";

// Define the shape of the context state
interface DataContextState {
  setCurrentWindow: (val: string) => void;
  isConnected: boolean;
  profile: SelfData | undefined;
  setName: (n: string) => void;
  clearName: () => void;
  clearIdentity: () => void;
  currentWindow: string;
  sendMassage: (v: string, cb: () => void) => void;
  chatData: ChatData;
  setChatSeen: (chatId: string) => void;
  unseenChats: string[];
}

// Create Context Object
export const DataContext = createContext<DataContextState>({
  setCurrentWindow: (val) => {},
  isConnected: false,
  profile: undefined,
  setName: (n) => {},
  clearName: () => {},
  clearIdentity: () => {},
  currentWindow: "public",
  sendMassage: (v, cb) => {},
  chatData: {},
  setChatSeen: (chatId: string) => {},
  unseenChats: [],
});

// Define the props for the provider component
interface ListContextProviderProps {
  children: ReactNode;
}

// Create a provider for components to consume and subscribe to changes
export const ListContextProvider: React.FC<ListContextProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<SelfData>();
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [chatData, setChatData] = useState<ChatData>({
    public: {
      user: { id: "public", name: "public" },
      messages: [],
      status: "on",
    },
  });

  const [unseenChats, setUnseenChats] = useState<string[]>([]);

  const [currentWindow, setCurrentWindow] = useState<string>("public");

  // socket logic
  useEffect(() => {
    // get old profile from storage
    const oldProfile = loadProfile();

    //connect to server
    socket.connect();

    function onConnect() {
      setIsConnected(true);

      // handle reconnecting or restoring old profile
      if (oldProfile) {
        socket.emit("profile", oldProfile, (selfData: SelfData) => {
          if (!selfData) return clearProfile();
          saveProfile(selfData);
          setProfile(selfData);
        });
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // receive user list
    function onUsers(users: User[]) {
      console.log("onUsers", users);

      setChatData((old) => {
        const temp = { ...old };

        // mark missing users as OFF
        const keys = Object.keys(temp).filter((k) => k !== "public");
        keys.forEach((key) => {
          const onlineUser = users.find((u) => u.id === temp[key].user.id);
          if (!onlineUser) {
            temp[key].status = "off";
          }
        });

        // mark incoming users as on or create new
        users.forEach((u) => {
          const chat = temp[u.id] ?? {
            messages: [],
            unseen: false,
          };
          chat.user = u;
          chat.status = "on";
          temp[u.id] = chat;
        });
        return temp;
      });
    }

    // receiving message
    function onSend(m: Message) {
      setChatData((old) => {
        const temp = { ...old };
        const chatId = m.toId === "public" ? m.toId : m.fromId;
        temp[chatId].messages.push(m);
        setUnseenChats((p) => [...p, chatId]);

        return temp;
      });
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("users", onUsers);
    socket.on("send", onSend);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("users", onUsers);
      socket.off("send", onSend);
    };
  }, [isConnected, profile]);

  const clearIdentity = () => {
    setChatData({
      public: {
        user: { id: "public", name: "public" },
        messages: [],
        status: "on",
      },
    });
    setProfile(undefined);
    clearProfile();
    socket.disconnect();
    socket.connect();
  };

  const clearName = () => {
    if (profile) setProfile({ ...profile, name: "" });
  };

  const setName = (name: string) => {
    if (!isConnected) return;
    name = name.trim();
    if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) return;

    socket.emit(
      "profile",
      { name, conId: profile?.conId, salt: profile?.salt },
      (selfData: SelfData) => {
        if (!selfData) return clearProfile();
        saveProfile(selfData);
        setProfile(selfData);
      }
    );
  };

  const sendMassage = (text: string, cb: () => void) => {
    if (!socket.connected || !profile) return;

    text = text.trim();
    if (text.length < 1 || text.length > TEXT_MAX_LENGTH) return;

    const m: ToSendMessage = {
      text: text,
      senderName: profile.name,
      fromId: profile.salt,
      toId: chatData[currentWindow].user.id,
    };
    socket.emit("send", m, (M: Message) => {
      setChatData((old) => {
        const temp = { ...old };
        const chatId = M.toId;
        temp[chatId].messages.push(M);
        return temp;
      });
      cb && cb();
    });
  };

  const setChatSeen = (chatId: string) => {
    setUnseenChats((p) => p.filter((c) => c !== chatId));
  };

  useEffect(() => {
    if (unseenChats.includes(currentWindow)) setChatSeen(currentWindow);
  }, [unseenChats, currentWindow]);

  return (
    <DataContext.Provider
      value={{
        setCurrentWindow,
        isConnected,
        profile,
        setName,
        clearIdentity,
        clearName,
        currentWindow,
        sendMassage,
        chatData,
        setChatSeen,
        unseenChats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

const useData = () => {
  return useContext(DataContext);
};

export default useData;
