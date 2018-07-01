import * as multicastdns from "multicast-dns";
import * as net from "net";
import * as addr from "network-address";

// interfaces
type EventHandler = (data: any, remoteAddr: string, remotePort: number) => void;

interface ChannelSubscription {
  channel: string,
  eventHandler: EventHandler,
}

interface PseudoServer {
  channelSubscriptions: ChannelSubscription[],
  peerConnections: {},
  peers: {},
  subscribe: (channel: string, eventHandler: EventHandler) => void,
  unsubscribe: (channel: string) => void,
}

export interface Network {
  on: (event: string, listener: (...args: any[]) => void) => net.Socket,
  // on: (...param: any[]) => void,
  subscribe: (channel: string, eventHandler: EventHandler) => void,
  unsubscribe: (channel: string) => void,
}

export interface Peer {
  addr: string,
  port: number,
}

interface P2PMessage {
  remoteAddr: string,
  remoteData: any,
  remotePort: number,
}

// logic
export function P2PNetwork(networkName: string): net.Server {
  /* ----------- Setup ----------- */
  // setup stuff
  const mdns = multicastdns();
  const server: net.Server = net.createServer(onPeerConnect);

  let hostAddr: string = "127.0.0.1";
  let hostPort: number = 0;
  let hostName: string = "127.0.0.1:0";

  /* ----------- Helper Functions ----------- */
  function onReceiveMessage(message: P2PMessage) {
    const remoteAddr = message.remoteAddr;
    const remoteData = message.remoteData;
    const remotePort = message.remotePort;

    if (pseudoServer.channelSubscriptions.length === 0) {
      server.emit("peer-message-received", {
        addr: remoteAddr,
        data: remoteData.data,
        port: remotePort,
      });
    } else {
      pseudoServer.channelSubscriptions.forEach((subscription) => {
        if (subscription.channel === remoteData.channel) {
          subscription.eventHandler(remoteData.data, remoteAddr, remotePort);
        }
      });
    }
  }

  function processReceivedMessage(data: Buffer, remoteAddr: string, remotePort: number) {
    // storage for messages
    let messages = [];
    // split the message if nessecary
    if (data.toString().indexOf("\r\n") > -1) {
      messages = data.toString().split("\r\n");
      messages = messages.filter(m => m !== (undefined || null || ""));
    } else {
      messages.push(data.toString());
    }
    // process each message
    messages.forEach((message) => {
      onReceiveMessage({
        remoteAddr,
        remoteData: JSON.parse(message),
        remotePort,
      });
    });
  }

  function onPeerDisconnect(peer: Peer) {
    // get peer name
    const peerName = `${peer.addr}:${peer.port}`;
    // remove peer from peer list and connections list
    delete pseudoServer.peers[peerName];
    delete pseudoServer.peerConnections[peerName];
    // emit signal
    server.emit("peer-disconnected", peer);
  }

  function onPeerConnect(peerConnection: any): void {
    // peer information
    let peerAddr = peerConnection.remoteAddress;
    let peerPort = peerConnection.remotePort;

    if (peerAddr === null || typeof peerAddr === "undefined") {
      peerAddr = "127.0.0.1";
    }
    if (peerPort === null || typeof peerPort === "undefined") {
      peerPort = 0;
    }
    if (net.isIPv6(peerAddr)) {
      peerAddr = peerAddr.substring(7);
    }

    const peerName = `${peerAddr}:${peerPort}`;
    // store open connections
    const peer = {
      addr: peerAddr,
      port: peerPort,
    };
    // update server information
    pseudoServer.peers[peerName] = peer;
    pseudoServer.peerConnections[peerName] = peerConnection;
    server.emit("peer-connected", peer);
    // listen to disconnection event
    peerConnection.on("close", () => onPeerDisconnect(peer));
    peerConnection.on("data", (data: Buffer) => processReceivedMessage(data, peerAddr, peerPort));
  }

  function sendMulticastResponse(): void {
    mdns.response([{
      data: {
        port: hostPort,
        priority: 10,
        target: hostAddr,
        weight: 0,
      },
      name: networkName,
      type: "SRV",
    }]);
  }

  function connectToPeer(remoteAddr: string, remotePort: number): void {
    // get peer name
    const remoteName = `${remoteAddr}:${remotePort}`;
    // do not connect to localhost
    if (remoteName === hostName) {
      return;
    }
    // if there is already an open connection do not establish another
    if (remoteName in pseudoServer.peerConnections) {
      return;
    }
    if (remoteName < hostName) {
      sendMulticastResponse();
      return;
    }
    // create new connection to other TCP server
    const peerConnection = net.connect(remotePort, remoteAddr, undefined);
    // store created peer connection
    pseudoServer.peers[remoteName] = { addr: remoteAddr, port: remotePort };
    pseudoServer.peerConnections[remoteName] = peerConnection;
    server.emit("peer-connected", pseudoServer.peers[remoteName]);
    // if something is wrong with the connection, close it
    peerConnection.on("error", (error) => {
      peerConnection.destroy();
      server.emit("peer-connection-failed", error);
    });
    // if connection is closed
    peerConnection.on("close", () => onPeerDisconnect(pseudoServer.peers[remoteName]));
    peerConnection.on("data", data => processReceivedMessage(data, remoteAddr, remotePort));
  }

  mdns.on("query", (query: any) => {
    // check if query asks for current network
    for (const network of query.questions) {
      if (network.name === networkName && network.type === "SRV") {
        sendMulticastResponse();
        // stop inspecting other query objects, since the network
        // identifier is unique...
        return;
      }
    }
  });

  mdns.on("response", (response: any) => {
    // connect to each responding peer
    for (const network of response.answers) {
      if (network.name === networkName && network.type === "SRV") {
        connectToPeer(network.data.target, network.data.port);
      }
    }
  });

  function discover(): void {
    // query ip addresses of network participants
    mdns.query([{ name: networkName, type: "SRV" }]);
    // ask every 4 seconds again
    const interval = setInterval(() => mdns.query([{
      name: networkName,
      type: "SRV",
    }]), 4000);
    // if server is stopped, the interval has to stop too and the network emits stop signal
    server.on("close", () => {
      clearInterval(interval);
      server.emit("offline", true);
    });
  }

  function broadcastMessage(content: string, ch: string = "broadcast"): void {
    Object.keys(pseudoServer.peerConnections).forEach((peerName) => {
      // construct message object
      const message = {
        channel: ch,
        data: content,
      };
      // send message as string to peer
      pseudoServer.peerConnections[peerName].write(`${JSON.stringify(message)}\r\n`);
    });
  }

  function sendMessage(remoteAddr: string, remotePort: number, content: string, ch = "none"): void {
    const connection = pseudoServer.peerConnections[`${remoteAddr}:${remotePort}`];
    if (connection !== null && typeof connection !== "undefined") {
      // construct message object
      const message = {
        channel: ch,
        data: content,
      };
      // send message as string to peer
      connection.write(`${JSON.stringify(message)}\r\n`);
    }
  }

  function subscribe(channel: string, eventHandler: EventHandler): void {
    // if there is already a subscription do not add a new one
    // for (let i = 0; i < pseudoServer.channelSubscriptions.length; i += 1) {
    //   const subscription = pseudoServer.channelSubscriptions[i];
    for (const subscription of pseudoServer.channelSubscriptions) {
      if (subscription.channel === channel) {
        return;
      }
    }

    // add a new subscription
    pseudoServer.channelSubscriptions.push({ channel, eventHandler });
  }

  function unsubscribe(channel: string): void {
    for (let i = 0; i < pseudoServer.channelSubscriptions.length; i += 1) {
      const subscription = pseudoServer.channelSubscriptions[i];
    // for (const subscription of pseudoServer.channelSubscriptions) {
      if (subscription.channel === channel) {
        pseudoServer.channelSubscriptions.splice(i, 1);
        return;
      }
    }
  }

  /* ----------- Network logic ----------- */
  // start server...
  server.listen();

  // gather information about server
  hostAddr = addr();
  hostPort = server.address().port;
  hostName = `${hostAddr}:${hostPort}`;

  // start network discovery
  server.on("listening", () => {
    // emit signal: Network is online!
    server.emit("online", {
      addr: hostAddr,
      port: hostPort,
    });
    // start discovery process
    discover();
  });

  // event handling
  server.on("broadcast-message", broadcastMessage);
  server.on("publish", m => broadcastMessage(m.content, m.channel));
  server.on("send-message", m => sendMessage(m.remoteAddr, m.remotePort, m.content));
  server.on("send-message-to-channel", m => sendMessage(m.remoteAddr, m.remotePort, m.content, m.channel));

  // remember stuff in pseudoserver and merge it at the end
  const pseudoServer: PseudoServer = {
    channelSubscriptions: [],
    peerConnections: {},
    peers: {},
    subscribe,
    unsubscribe,
  }

  // merge server and pseudoserver
  return server;
}
