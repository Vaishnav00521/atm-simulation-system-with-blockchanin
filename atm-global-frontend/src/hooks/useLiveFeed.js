import { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
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
    let client;
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
      // Convert standard http/https API_URL to ws/wss protocol for native WebSockets
      const wsUrl = API_URL.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');

      client = new Client({
        brokerURL: `${wsUrl}/ws-fintech`,
        reconnectDelay: 10000,
        onConnect: () => {
          connected = true;
          if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
          }
          client.subscribe('/topic/live-feed', (message) => {
            try {
              const newFeedData = JSON.parse(message.body);
              setFeed(prev => [newFeedData, ...prev].slice(0, 12));
            } catch (e) {
              // Ignore parsing errors
            }
          });
        },
        onStompError: () => { if (!connected) startSimulation(); },
        onWebSocketError: () => { if (!connected) startSimulation(); },
        onWebSocketClose: () => { if (!connected) startSimulation(); },
      });

      client.activate();
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
      if (client && client.active) client.deactivate();
    };
  }, []);

  return feed;
};
