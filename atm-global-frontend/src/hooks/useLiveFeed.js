import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api/axiosClient';

const SYSTEM_LOGS = [
  "Liquidity vault rebalancing completed.",
  "Consensus confirmed: block committed to ledger.",
  "Internal state synchronized with MySQL database.",
  "Smart contract method 'distributeLiquidity' called.",
  "Gas calibration optimizer updated: current fee 12 Gwei.",
  "New wallet session initialized via secure routing.",
  "API ping: OK, Server response latency 45ms.",
  "Network health check: Node-01 operational."
];

export const useLiveFeed = () => {
  const [feed, setFeed] = useState([
    { time: new Date().toLocaleTimeString(), node: 'Sys-Core', action: 'Neural link established. Awaiting directives.' }
  ]);

  useEffect(() => {
    let socket;
    let simulationInterval;
    let connected = false;

    // Simulation fallback keeps the UI alive if the backend is down
    const startSimulation = () => {
      if (simulationInterval) return;
      simulationInterval = setInterval(() => {
        const randomLog = SYSTEM_LOGS[Math.floor(Math.random() * SYSTEM_LOGS.length)];
        const newNode = ["Validator-A", "Mainnet-01", "Tokyo-RPC", "Vault-Node"][Math.floor(Math.random() * 4)];
        setFeed(prev => [
          { time: new Date().toLocaleTimeString(), node: newNode, action: randomLog },
          ...prev
        ].slice(0, 12));
      }, 5000);
    };

    try {
      // Determine the Socket.IO URL.
      // We will replace the port with 8085 for the Socket.IO server.
      let socketUrl = API_URL || window.location.origin;
      try {
        const urlObj = new URL(socketUrl);
        urlObj.port = '8085';
        socketUrl = urlObj.toString().replace(/\/$/, "");
      } catch (e) {
        // Fallback if API_URL is relative
        socketUrl = 'http://localhost:8085';
      }

      socket = io(socketUrl, {
        reconnectionDelay: 10000,
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        connected = true;
        if (simulationInterval) {
          clearInterval(simulationInterval);
          simulationInterval = null;
        }
      });

      socket.on('live-feed', (data) => {
        try {
          const newFeedData = typeof data === 'string' ? JSON.parse(data) : data;
          setFeed(prev => [newFeedData, ...prev].slice(0, 12));
        } catch (e) {
          // Ignore parsing errors
        }
      });

      socket.on('connect_error', () => {
        if (!connected) startSimulation();
      });

      socket.on('disconnect', () => {
        connected = false;
        startSimulation();
      });

    } catch (err) {
      console.warn("[WS] Socket error. Activating mock simulation mode:", err.message);
      startSimulation();
    }

    // Fallback if websocket connection fails to connect within 4 seconds
    const fallbackTimer = setTimeout(() => {
      if (!connected) {
        startSimulation();
      }
    }, 4000);

    return () => {
      clearTimeout(fallbackTimer);
      if (simulationInterval) clearInterval(simulationInterval);
      if (socket) socket.disconnect();
    };
  }, []);

  return feed;
};
