import * as net from "net";
import React from "react";
import * as Moccasin from "./types";

import { ChatHistory } from "./chat-history";
import { ControlBar } from "./control-bar";
import { MessageForm } from "./message-form";
import { Sidebar } from "./sidebar";
import { UsernamePrompt } from "./username-prompt";

import { P2PNetwork, Peer } from "./peer2peer";

import "./app.css";

// App Properties
interface AppProps {};

// App State
interface AppState {
  chatPartners: Moccasin.User[],
  network: net.Server,
  userInfo: Moccasin.UserInfo
};

// App class and HTML representation
export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    // init state
    this.state = {
      chatPartners: [],
      network: P2PNetwork("Moccasin.isp.uni-luebeck.de.www"),
      userInfo: {
        image: "",
        ip: "",
        name: "",
        port: 0,
      },
    }

    // event handling for the created network
    this.handleOnline = this.handleOnline.bind(this);
    this.state.network.on("online", this.handleOnline);

    this.handlePeerConnected = this.handlePeerConnected.bind(this);
    this.state.network.on("peer-connected", this.handlePeerConnected);

    this.handlePeerDisconnected = this.handlePeerDisconnected.bind(this);
    this.state.network.on("peer-disconnected", this.handlePeerDisconnected);

    this.handlePeerMessageReceived = this.handlePeerMessageReceived.bind(this);
    this.state.network.on("peer-message-received", this.handlePeerMessageReceived);

    // bind this contenxt to handlers
    this.handleChangeConversation = this.handleChangeConversation.bind(this);
    this.handleUsernameEntered = this.handleUsernameEntered.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
  }

  updateUsername(ip: string, port: number, name: string): void {
    // get chat partners
    const newChatPartners: Moccasin.User[] = this.state.chatPartners.slice();
    for (const partner of newChatPartners) {
      if (partner.ip === ip && partner.port === port) {
        partner.name = name;
      }
    }
    // update chat partners
    this.setState({
      chatPartners: newChatPartners,
      network: this.state.network,
      userInfo: this.state.userInfo,
    });
  }

  updateMessages(ip: string, port: number, networkMessage: Moccasin.NetworkMessage) {
    // get chat partners
    const newChatPartners: Moccasin.User[] = this.state.chatPartners.slice();
    for (const partner of newChatPartners) {
      if (partner.ip === ip && partner.port === port) {
        partner.lastMessage = {
          fromMe: false,
          text: networkMessage.body,
          time: networkMessage.time,
        }
        partner.messages.push({
          fromMe: false,
          text: networkMessage.body,
          time: networkMessage.time,
        });
      }
    }
    // update state
    this.setState({
      chatPartners: newChatPartners,
      network: this.state.network,
      userInfo: this.state.userInfo,
    });
  }

  handleSendMessage(message: string): void {
    // update own history
    const now: number = Date.now();
    const msg: Moccasin.Message = {
      fromMe: true,
      text: message,
      time: now,
    }
    const newChatPartners: Moccasin.User[] = this.state.chatPartners;
    // get active conversation
    let addr: string = "";
    let port: number = 0;
    for (const partner of newChatPartners) {
      if (partner.activeConversation) {
        addr = partner.ip;
        port = partner.port;
        partner.messages.push(msg);
        partner.lastMessage = msg;
      }
    }
    this.state.network.emit("send-message", {
      content: JSON.stringify({
        body: message,
        time: now,
        type: "MSG",
      }),
      remoteAddr: addr,
      remotePort: port,
    });
    // update history
    this.setState({
      chatPartners: newChatPartners,
      network: this.state.network,
      userInfo: this.state.userInfo,
    });
  }

  handleUsernameEntered(username: string): void {
    this.setState({
      chatPartners: this.state.chatPartners,
      userInfo: {
        image: this.state.userInfo.image,
        ip: this.state.userInfo.ip,
        name: username,
        port: this.state.userInfo.port,
      },
    });
    // send username to chat partners
    for (const partner of this.state.chatPartners) {
      this.state.network.emit("send-message", {
        content: JSON.stringify({
          body: username,
          time: Date.now(),
          type: "RUN",
        }),
        remoteAddr: partner.ip,
        remotePort: partner.port,
      });
      // if the username for a given user is not known ask for it!
      if (partner.name === "") {
        this.state.network.emit("send-message", {
          content: JSON.stringify({
            body: "",
            time: Date.now(),
            type: "AUN",
          }),
          remoteAddr: partner.ip,
          remotePort: partner.port,
        });
      }
    }
  }

  handlePeerMessageReceived(message: Moccasin.NetworkMessageRaw): void {
    const messageObj: Moccasin.NetworkMessage = JSON.parse(message.data);
    const remoteAddr: string = message.addr;
    const remotePort: number = message.port;
    const type: string = messageObj.type;
    const body: string = messageObj.body;
    // if we got ask for username
    if (type === "AUN" && this.state.userInfo.name !== "") {
      // send message with own username to sender
      this.state.network.emit("send-message", {
        content: JSON.stringify({
          body: this.state.userInfo.name,
          time: Date.now(),
          type: "RUN",
        }),
        remoteAddr,
        remotePort,
      });
    } else if (type === "RUN") {
      // update the chat partners
      this.updateUsername(remoteAddr, remotePort, body);
    } else if (type === "MSG") {
      // add message to last message in sidebar
      this.updateMessages(remoteAddr, remotePort, messageObj);
    }
  }

  handlePeerConnected(peer: Peer): void {
    // construct new peer object
    const newPeer: Moccasin.User = {
      activeConversation: false,
      image: "",
      ip: peer.addr,
      lastMessage: {
        fromMe: false,
        text: "There are no messages send within this conversation.",
        time: Date.now(),
      },
      messages: [],
      name: "",
      port: peer.port,
    };
    // get existing chat partners
    const newChatPartners: Moccasin.User[] = this.state.chatPartners.slice();
    // append new one
    newChatPartners.push(newPeer);
    // if there is no active conversation make the first conversation active
    let anyActiveConversation: boolean = false;
    for (const partner of newChatPartners) {
      if (partner.activeConversation) {
        anyActiveConversation = true;
        break;
      }
    }
    if (!anyActiveConversation) {
      newChatPartners[0].activeConversation = true;
    }
    // set new state
    this.setState({
      chatPartners: newChatPartners,
      userInfo: this.state.userInfo,
    });
  }

  handlePeerDisconnected(peer: Peer): void {
    // find peer which should be removed from list
    const newChatPartners: Moccasin.User[] = [];
    for (const partner of this.state.chatPartners) {
      if (partner.ip !== peer.addr && partner.port !== peer.port) {
        newChatPartners.push(partner);
      }
    }
    // if there is no active conversation make the first conversation active
    if (newChatPartners.length > 0) {
      let anyActiveConversation: boolean = false;
      for (const partner of newChatPartners) {
        if (partner.activeConversation) {
          anyActiveConversation = true;
          break;
        }
      }
      if (!anyActiveConversation) {
        newChatPartners[0].activeConversation = true;
      }
    }
    // update internal state
    this.setState({
      chatPartners: newChatPartners,
      userInfo: this.state.userInfo,
    });
  }

  handleOnline(obj: any): void {
    console.log("Peer2Peer Network online", obj);
  }

  handleChangeConversation(newActivePartner: Moccasin.User): void {
    // get a copy of all chat partners
    const newChatPartners: Moccasin.User[] = this.state.chatPartners.slice();
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
    this.setState({
      chatPartners: newChatPartners,
      network: this.state.network,
      userInfo: this.state.userInfo,
    });
  }

  renderChatTitle(): React.ReactNode {
    // get active conversation to display name on chat history
    let chatPartner: string = "nobody";
    let username: string = "Me";
    if (this.state.userInfo.name !== "") {
      username = this.state.userInfo.name;
    }
    for (const partner of this.state.chatPartners) {
      if (partner.activeConversation) {
        chatPartner = partner.name;
        break;
      }
    }
    // return HTMLElement
    return (
      <div className="moccasin-chat-partner-name">
        {username + " to " + chatPartner}
      </div>
    );
  }

  render(): React.ReactNode {
    // get messages from the active conversation
    let messages: Moccasin.Message[] = [];
    for (const partner of this.state.chatPartners) {
      if (partner.activeConversation) {
        messages = partner.messages.slice();
        break;
      }
    }
    return (
      <div className="moccasin-app">
        <UsernamePrompt
          onUsernameEntered={this.handleUsernameEntered}
        />
        <ControlBar />
        <Sidebar
          chatPartners={this.state.chatPartners}
          onChangedConversation={this.handleChangeConversation}
        />
        <div className="moccasin-content">
          {this.renderChatTitle()}
          <ChatHistory
            messages={messages}
          />
          <MessageForm
            onSendMessage={this.handleSendMessage}
          />
        </div>
      </div>
    );
  }
}
