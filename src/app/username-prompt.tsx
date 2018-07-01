import React from "react";

import "./username-prompt.css";

export interface UsernamePromptProps {
  onUsernameEntered: (name: string) => void
};
export interface UsernamePromptState {};

export class UsernamePrompt extends React.Component<UsernamePromptProps, UsernamePromptState> {
  constructor(props: UsernamePromptProps) {
    super(props);
  }

  handleFocus(searchText: HTMLSpanElement): void {
    if (searchText.innerText === "Please enter your Nickname...") {
      searchText.innerText = "";
    }
  }

  handleBlur(searchText: HTMLSpanElement): void {
    if (searchText.innerText === "") {
      searchText.innerText = "Please enter your Nickname...";
    }
  }

  handleClick(button: HTMLButtonElement): void {
    const prompt: HTMLDivElement = document.getElementById("moccasin-username-prompt") as HTMLDivElement;
    const nicknameSpan: HTMLSpanElement = document.getElementById("nickname") as HTMLSpanElement;
    const nickname: string = nicknameSpan.innerHTML.trim();
    if (nickname !== "Please enter your Nickname..." && nickname !== "") {
      if (prompt !== null) {
        prompt.remove();
        this.props.onUsernameEntered(nickname);
      }
    }
  }

  render(): React.ReactNode {
    return (<div
      id="moccasin-username-prompt"
    >
      <span
        contentEditable={true}
        id="nickname"
        onFocus={(event) => this.handleFocus(event.currentTarget)}
        onBlur={(event) => this.handleBlur(event.currentTarget)}
      >
        Please enter your Nickname...
      </span>
      <button
        onClick={(event) => this.handleClick(event.currentTarget)}
      >
        accept
      </button>
    </div>);
  }
}
