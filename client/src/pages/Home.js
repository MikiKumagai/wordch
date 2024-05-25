import { useEffect, useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import useStompClient from './../common/useStompClient';

export default function Home() {
  const [playerAmount, setPlayerAmount] = useState(0);
  const [dealerAmount, setDealerAmount] = useState(0);
  const { connect, disconnect, connected, stompClient } = useStompClient('http://localhost:8080/gs-guide-websocket', 'YOUR_TOKEN');

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const clickPlayer = () => {
    stompClient.send('/app/hello', {}, JSON.stringify({ 'name': 'player' }));
    setPlayerAmount(playerAmount + 1);
  };

  const clickDealer = () => {
    stompClient.send('/app/hello', {}, JSON.stringify({ 'name': 'dealer' }));
    setDealerAmount(dealerAmount + 1);
  };

  return (
    <Container>
      <Row>
        <Col>
          <Button variant='light' type="button" onClick={clickPlayer}>player</Button>
        </Col>
        <Col>
          <h1>player: {playerAmount}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant='light' type="button" onClick={clickDealer}>dealer</Button>
        </Col>
        <Col>
          <h1>dealer: {dealerAmount}</h1>
        </Col>
      </Row>
      <div>
        Connection status: {connected ? 'Connected' : 'Disconnected'}
      </div>
    </Container>
  );
}
