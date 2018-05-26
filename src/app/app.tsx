import React from "react";

import { ChatHistory } from "./chat-history";
import { ControlBar } from "./control-bar";
import { MessageForm } from "./message-form";
import { Sidebar } from "./sidebar";

import "./app.css";

// App Properties
interface AppProps {};

// App State
export interface Message {
  fromMe: boolean,
  text: string,
  time: number,
};

export interface User {
  activeConversation: boolean,
  image: string,
  ip: string,
  lastMessage: Message,
  name: string,
  port: number,
};

export interface UserInfo {
  image: string,
  ip: string,
  name: string,
  port: number
};

interface AppState {
  chatPartners: User[],
  userInfo: UserInfo,
  messageText: string
};

// App class and HTML representation
export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      chatPartners: [
        {
          activeConversation: true,
          image: "",
          ip: "localhost",
          lastMessage: {
            fromMe: false,
            text: "Wer reitet so spät durch Nacht und Wind?"
              + " Es ist der Vater mit seinem Kind;"
              + " Er hat den Knaben wohl in dem Arm,"
              + " Er faßt ihn sicher, er hält ihn warm.\n"
              + " Mein Sohn, was birgst du so bang dein Gesicht? -"
              + " Siehst Vater, du den Erlkönig nicht?"
              + " Den Erlenkönig mit Kron und Schweif? -"
              + " Mein Sohn, es ist ein Nebelstreif. -\n"
              + " \"Du liebes Kind, komm, geh mit mir!"
              + " Gar schöne Spiele spiel ich mit dir;"
              + " Manch bunte Blumen sind an dem Strand,"
              + " Meine Mutter hat manch gülden Gewand.\"",
            time: 1527399338,
          },
          name: "Denis-Michael Lux",
          port: 3000,
        },
        {
          activeConversation: false,
          image: "",
          ip: "localhost",
          lastMessage: {
            fromMe: false,
            text: " Mein Vater, mein Vater, und hörest du nicht,"
              + " Was Erlenkönig mir leise verspricht? -"
              + " Sei ruhig, bleibe ruhig, mein Kind;"
              + " In dürren Blättern säuselt der Wind. -\n"
              + " \"Willst, feiner Knabe, du mit mir gehn?"
              + " Meine Töchter sollen dich warten schön;"
              + " Meine Töchter führen den nächtlichen Reihn"
              + " Und wiegen und tanzen und singen dich ein.\"\n"
              + " Mein Vater, mein Vater, und siehst du nicht dort"
              + " Erlkönigs Töchter am düstern Ort? -"
              + " Mein Sohn, mein Sohn, ich seh es genau:"
              + " Es scheinen die alten Weiden so grau. -",
            time: 1527399338,
          },
          name: "Malte Schmitz",
          port: 3001,
        },
        {
          activeConversation: false,
          image: "",
          ip: "localhost",
          lastMessage: {
            fromMe: false,
            text: " \"Ich liebe dich, mich reizt deine schöne Gestalt;"
              + " Und bist du nicht willig, so brauch ich Gewalt.\""
              + " Mein Vater, mein Vater, jetzt faßt er mich an!"
              + " Erlkönig hat mir ein Leids getan! -\n"
              + " Dem Vater grauset's, er reitet geschwind,"
              + " Er hält in den Armen das ächzende Kind,"
              + " Erreicht den Hof mit Mühe und Not;"
              + " In seinen Armen das Kind war tot.",
            time: 1527399338,
          },
          name: "Torben Scheffel",
          port: 3002,
        },
      ],
      messageText: "",
      userInfo: {
        image: "",
        ip: "",
        name: "",
        port: 0,
      },
    }
    // bind this contenxt to handlers
    this.handleChangeConversation = this.handleChangeConversation.bind(this);
  }

  handleChangeConversation(newActivePartner: User): void {
    // get a copy of all chat partners
    const newChatPartners: User[] = this.state.chatPartners.slice();
    // update copy
    for (const partner of newChatPartners) {
      // each element is not active now
      partner.activeConversation = false;
      // if the clicked element is found activate it
      if (partner.ip === newActivePartner.ip && partner.port === newActivePartner.port) {
        partner.activeConversation = true;
      }
    }
    // store changes in the actual object to cause a rerendering
    this.setState({ chatPartners: newChatPartners });
  }

  renderChatTitle(): React.ReactNode {
    // get active conversation to display name on chat history
    let chatPartner: string = "";
    for (const partner of this.state.chatPartners) {
      if (partner.activeConversation) {
        chatPartner = partner.name;
        break;
      }
    }
    // return HTMLElement
    return (
      <div className="moccasin-chat-partner-name">
        {chatPartner}
      </div>
    );
  }

  render(): React.ReactNode {
    return (
      <div className="moccasin-app">
        <ControlBar />
        <Sidebar
          chatPartners={this.state.chatPartners}
          onChangedConversation={this.handleChangeConversation}
        />
        <div className="moccasin-content">
          {this.renderChatTitle()}
          <ChatHistory />
          <MessageForm />
        </div>
      </div>
    );
  }
}
