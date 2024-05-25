import { Button, Card, Container } from 'react-bootstrap';
import { useState } from 'react';
import { Client } from '@stomp/stompjs'; 
import SockJS from 'sockjs-client';

export default function Landing() {
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const connect = () => {
    const socket = new SockJS('http://localhost:8080/gs-guide-websocket');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      }
    });

    client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      setIsConnected(true);
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    setStompClient(client);
  };

  const disconnect = () => {
    if (stompClient !== null) {
      stompClient.deactivate();
    }
    setIsConnected(false);
    console.log("Disconnected");
  };




  // var stompClient = null;

  // const connect = () => {
    // var socket = new SockJS('http://localhost:8080/gs-guide-websocket');
    // stompClient = Stomp.over(socket);
    // stompClient.connect({}, function (frame) {
    //     setIsConnected(true);
    //     console.log('Connected: ' + frame);
    //     stompClient.subscribe('/topic/greetings', function (greeting) {
    //         showGreeting(JSON.parse(greeting.body).content);
    //     });
    // });
  // }

  // const disconnect =()=> {
  //     if (stompClient !== null) {
  //         stompClient.disconnect();
  //     }
  //     setIsConnected(false)
  //     console.log("Disconnected");
  // }
  
  return (
    <Container>
      <Card>
        <Card.Body>
        <Button type="submit" variant="secondary" disabled={isConnected} onChange={()=>connect()}>Connect</Button>
        <Button type="submit" variant="secondary"disabled={!isConnected} onChange={()=>disconnect()}>Disconnect</Button>

          {/* <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={3}>
                <Form.Control {...register("password")} type="text" className="me-auto" placeholder="password" />
                <Button type="submit" variant="secondary">Connect</Button>
              </Stack>
            </form>
          </FormProvider> */}
        </Card.Body>
      </Card>
    </Container>
  );
}