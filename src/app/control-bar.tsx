import { ipcRenderer } from "electron";
import React from "react";

import "./control-bar.css";

export function ControlBar(props: {}): JSX.Element {
  return (
    <div className={`moccasin-control-bar ${process.platform}`}>
      <a onClick={close} className="option close ion-close-circled" />
      <a onClick={maximize} className="option maximize ion-plus-circled" />
      <a onClick={minimize} className="option minimize ion-minus-circled" />
    </div>
  );
}

function minimize(): void {
  ipcRenderer.send("window-minimize");
}

function maximize(): void {
  ipcRenderer.send("window-maximize");
}

function close(): void {
  ipcRenderer.send("window-close");
}
