export type User = {
  id: string;
  name: string;
};

export type ToSendMessage = {
  text: string;
  senderName: string; // sender name
  fromId: string; // sender id
  toId: string; // receiver id || public
};

export type Message = ToSendMessage & {
  seen?: boolean;
  ts: number;
};

export type ChatData = Record<
  string,
  {
    user: User;
    messages: Message[];
    status: "on" | "off";
  }
>;

export type SelfData = {
  conId: string;
  name: string;
  salt: string;
};
