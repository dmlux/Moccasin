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
interface ChatHistoryProps {};

// ChatHistory state
interface ChatHistoryState {
  messages: Message[],
};

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
    this.state = {
      messages: [
        {
          fromMe: true,
          text: "Hallo wie gehts?",
          time: 1527279338,
        },
        {
          fromMe: false,
          text: "ja ganz gut, und selbst?",
          time: 1527289338,
        },
        {
          fromMe: true,
          text: "Auch gut, danke der Nachfrage!",
          time: 1527299338,
        },
        {
          fromMe: false,
          text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam"
            + " nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,"
            + " sed diam voluptua. At vero eos et accusam et justo duo dolores et ea"
            + " rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum"
            + " dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,"
            + " sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam"
            + " erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et"
            + " ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem"
            + " ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing"
            + " elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            + " aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores"
            + " et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem"
            + " ipsum dolor sit amet."
            + " nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,"
            + " sed diam voluptua. At vero eos et accusam et justo duo dolores et ea"
            + " rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum"
            + " dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,"
            + " sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam"
            + " erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et"
            + " ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem"
            + " ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing"
            + " elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            + " aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores"
            + " et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem"
            + " ipsum dolor sit amet."
            + " nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,"
            + " sed diam voluptua. At vero eos et accusam et justo duo dolores et ea"
            + " rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum"
            + " dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr,"
            + " sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam"
            + " erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et"
            + " ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem"
            + " ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing"
            + " elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            + " aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores"
            + " et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem"
            + " ipsum dolor sit amet.",
          time: 1527399338,
        },
      ],
    }
  }

  renderMessages(): React.ReactNode[] {
    const messages: React.ReactNode[] = [];
    for (const message of this.state.messages) {
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
