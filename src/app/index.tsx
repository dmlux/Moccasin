
import { webFrame } from "electron";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./app";

import "./index.css";

// disable zooming gestures like "pinch"
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

// render app content in div.root
ReactDOM.render(
  <App />,
  document.getElementById("root"),
);
