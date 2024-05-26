import { useState, useCallback, useMemo } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useStompClient = (url, token) => {
  const [connected, setConnected] = useState(false);

  const stompClient = useMemo(() => {
    const client = new Client({
      connectHeaders: {
        'Authorization': 'Bearer ' + token
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      onConnect: (frame) => {
        console.log('onConnect: ' + frame);
        setConnected(true);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        setConnected(false);
        client.deactivate();
      },
      onDisconnect: () => {
        console.log('onDisconnect');
        setConnected(false);
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
    });
    return client;
  }, [token]);

  const connect = useCallback(() => {
    if (stompClient && !connected) {
      if (url.startsWith('ws:') || url.startsWith('wss:')) {
        stompClient.webSocketFactory = () => new WebSocket(url);
      } else {
        stompClient.webSocketFactory = () => new SockJS(url);
      }
      stompClient.activate();
    }
  }, [stompClient, connected, url]);

  const disconnect = useCallback(() => {
    if (stompClient && connected) {
      stompClient.deactivate();
    }
  }, [stompClient, connected]);

  return { connected, stompClient, connect, disconnect };
};

export default useStompClient;