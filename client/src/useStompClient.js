import { useEffect, useState, useCallback, useMemo } from 'react';
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
        client.deactivate(); // エラー発生時に切断
      },
      onDisconnect: () => {
        console.log('onDisconnect');
        setConnected(false);
      },
      heartbeatIncoming: 0,  // サーバーからのハートビートメッセージを無視
      heartbeatOutgoing: 20000,  // 20秒ごとにハートビートメッセージを送信
    });

    return client;
  }, [token]);

  const connect = useCallback(() => {
    console.log('Attempting to connect...');
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
    console.log('Attempting to disconnect...');
    if (stompClient && connected) {
      stompClient.deactivate();
    }
  }, [stompClient, connected]);

  return { connected, stompClient, connect, disconnect };
};

export default useStompClient;