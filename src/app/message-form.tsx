import React from "react";

import "./message-form.css";

// MessageForm properties
interface MessageFormProps {
  onSendMessage: (message: string) => void
};

// MessageForm state
interface MessageFormState {
  text: string,
};

// MessageForm class and HTML representation
export class MessageForm extends React.Component<MessageFormProps, MessageFormState> {
  constructor(props: MessageFormProps) {
    super(props);
    this.state = {
      text: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleAttach = this.handleAttach.bind(this);
  }

  handleChange(content: string): void {
    this.setState({
      text: content,
    });
    // console.log(this.state.text);
  }

  handleSend(): void {
    // send message
    this.props.onSendMessage(this.state.text);
    // clear message box
    this.setState({
      text: "",
    });
  }

  handleAttach(): void {
    console.log("attach file");
  }

  handleLinebreak(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    // detect enter key pressed
    if (event.keyCode === 13) {
      event.preventDefault();
      this.handleSend();
    }
  }

  autosize(textarea: HTMLTextAreaElement): void {
    const rows: number = textarea.value.split("\n").length;
    textarea.rows = rows < 3 ? rows : 3;
  }

  render(): React.ReactNode {
    return (
      <div className="moccasin-message-form">
        <a onClick={this.handleAttach}>
          <i className="ion-paperclip" />
        </a>
        <textarea
          id="moccasin-text-field"
          onChange={(event) => this.handleChange(event.target.value)}
          onKeyDown={(event) => this.handleLinebreak(event)}
          onKeyUp={(event) => this.autosize(event.currentTarget)}
          rows={1}
          value={this.state.text}
        />
        <a onClick={this.handleSend}>
          <i className="ion-paper-airplane" />
        </a>
      </div>
    );
  }
}
