import React from "react";

import { Message } from "./app";

import "./chat-history.css";

// MessageBubble Properties
interface MessageBubbleProps {
  content: string,
  fromMe: boolean,
  time: number,
};

// ChatHistory properties
interface ChatHistoryProps {
  messages: Message[],
};

// ChatHistory state
interface ChatHistoryState {};

// MessageBubble class and HTML representation
export function MessageBubble(props: MessageBubbleProps): JSX.Element {
  const date: Date = new Date(props.time);
  const format: string = `${date.getHours()}:${date.getMinutes()}`
  return (
    <div className={`moccasin-message-bubble ${props.fromMe ? "from-me" : ""}`}>
      <div className="avatar-time">
        <div className="avatar">
          <i className="ion-ios-person" />
        </div>
        <span className="time">
          {format}
        </span>
      </div>
      <div className="content-wrapper">
        <div className="alignment-wrapper">
          <div className="content">
            {props.content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ChatHistory class and HTML representation
export class ChatHistory extends React.Component<ChatHistoryProps, ChatHistoryState> {
  constructor(props: ChatHistoryProps) {
    super(props);
  }

  renderMessages(): React.ReactNode[] {
    const messages: React.ReactNode[] = [];
    for (const message of this.props.messages) {
      messages.push(<MessageBubble
        content={message.text}
        key={message.time}
        fromMe={message.fromMe}
        time={message.time}
      />);
    }
    return messages;
  }

  render(): React.ReactNode {
    return (
      <div className="moccasin-chat-history">
        {this.renderMessages()}
      </div>
    );
  }
}
