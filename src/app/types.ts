export interface NetworkMessageRaw {
  addr: string,
  port: number,
  data: string
}

export interface NetworkMessage {
  body: string,
  time: number,
  type: string,
}

export interface Message {
  fromMe: boolean,
  text: string,
  time: number,
};

export interface User {
  activeConversation: boolean,
  ip: string,
  messages: Message[],
  lastMessage: Message,
  name: string,
  port: number,
};
