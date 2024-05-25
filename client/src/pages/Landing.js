import { Button, Card, Container } from 'react-bootstrap';
import { useState } from 'react';
import { Client } from '@stomp/stompjs'; 
import SockJS from 'sockjs-client';

export default function Landing() {
  const [stompClient, setStompClient] = useState(null);
  const YOUR_TOKEN = 'YOUR_TOKEN';

  const connect = () => {
    const socket = new SockJS('http://localhost:8080/gs-guide-websocket', {}, 
    { headers: { 'Authorization': 'Bearer ' + YOUR_TOKEN } });
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      }
    });
    client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
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
    console.log("Disconnected");
  };
  
  return (
    <Container>
      <Card>
        <Card.Body>
        <Button type="submit" variant="secondary"  onClick={()=>connect()}>Connect</Button>
        <Button type="submit" variant="secondary" onClick={()=>disconnect()}>Disconnect</Button>

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