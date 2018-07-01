import React from "react";
import * as Moccasin from "./types";

import "./sidebar.css";

// SidebarItem properties
interface SidebarItemProps {
  active: boolean,
  info: Moccasin.User,
  onClick: (info: Moccasin.User, item: HTMLDivElement) => void
};

// Sidebar properties
interface SidebarProps {
  chatPartners: Moccasin.User[],
  onChangedConversation: (newActivePartner: Moccasin.User) => void
};

// Sidebar state
interface SidebarState {};

// SidebarItem class and HTML representation
export function SidebarItem(props: SidebarItemProps): JSX.Element {
  // get the first 200 characters from the message
  let message: string = props.info.lastMessage.text;
  if (message.length > 200) {
    message = message.substr(0, 200) + "...";
  }
  // define item class
  let itemClass: string = "moccasin-sidebar-item";
  if (props.active) {
    itemClass += " active";
  }
  // format timestamp to time
  const date = new Date(props.info.lastMessage.time);
  // format username
  let username: string = `${props.info.ip}:${props.info.port}`;
  if (props.info.name !== "") {
    username = props.info.name;
  }
  // render item
  return (
    <div
      className={itemClass}
      onClick={(event) => props.onClick(props.info, event.currentTarget)}
    >
      <div className="left-column">
        <div className="avatar">
          <i className="ion-ios-person" />
        </div>
      </div>
      <div className="right-column">
        <div className="name-time">
          <span className="name">{username}</span>
          <span className="time">{date.getHours() + ":" + date.getMinutes()}</span>
        </div>
        <div className="text">
          {message}
        </div>
      </div>
    </div>
  );
}

// Sidebar class and HTML representation
export class Sidebar extends React.Component<SidebarProps, SidebarState> {
  constructor(props: SidebarProps) {
    super(props);
    this.state = {}
    // bind this context to onClickHandler
    this.onClickHandler = this.onClickHandler.bind(this);
  }

  onClickHandler(info: Moccasin.User, item: HTMLDivElement): void {
    this.props.onChangedConversation(info);
  }

  handleFocus(searchText: HTMLSpanElement): void {
    if (searchText.innerText === "Search...") {
      searchText.innerText = "";
    }
  }

  handleBlur(searchText: HTMLSpanElement): void {
    if (searchText.innerText === "") {
      searchText.innerText = "Search...";
    }
  }

  renderSidebarItems(): React.ReactNode[] {
    // all chat partners as an array of items
    const sidebarItems: JSX.Element[] = [];
    // create item for each chat partner
    for (const partner of this.props.chatPartners) {
      sidebarItems.push(
        <SidebarItem
          active={partner.activeConversation}
          info={partner}
          onClick={this.onClickHandler}
          key={`${partner.ip}:${partner.port}`}
        />,
      );
    }
    // give back items
    return sidebarItems;
  }

  render(): React.ReactNode {
    return (
      <div className="moccasin-sidebar">
        <div className="search-bar">
          <span className="search-icon" >
            <i className="ion-ios-search-strong" />
          </span>
          <span
            contentEditable={true}
            className="search-text"
            onFocus={(event) => this.handleFocus(event.currentTarget)}
            onBlur={(event) => this.handleBlur(event.currentTarget)}
          >
            Search...
          </span>
        </div>
        <div className="chat-partner-list">
          {this.renderSidebarItems()}
        </div>
      </div>
    )
  }
}
