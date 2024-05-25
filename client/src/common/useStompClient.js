import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useStompClient = (url, token) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new SockJS(url);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'Authorization': 'Bearer ' + token
      },
      debug: (str) => {
        console.log(str);
      }
    });

    client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      setConnected(true);
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      setConnected(false);
      client.deactivate(); // エラー発生時に切断
    };

    client.onDisconnect = () => {
      console.log('Disconnected');
      setConnected(false);
    };

    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate(); // コンポーネントのアンマウント時に切断
      }
    };
  }, [url, token]);

  const connect = useCallback(() => {
    if (stompClient && !connected) {
      stompClient.activate();
    }
  }, [stompClient, connected]);

  const disconnect = useCallback(() => {
    if (stompClient && connected) {
      stompClient.deactivate();
    }
  }, [stompClient, connected]);

  return { connect, disconnect, connected, stompClient };
};

export default useStompClient;