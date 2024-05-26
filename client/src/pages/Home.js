import { useEffect, useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useStomp } from './../StompClientContext';

export default function Home() {
  const [playerAmount, setPlayerAmount] = useState(0);
  const [dealerAmount, setDealerAmount] = useState(0);
  const { connect, disconnect, connected, stompClient } = useStomp();

  useEffect(() => {
    if (connected) {
      if (playerAmount === 0 && dealerAmount === 0) {
        const data = {
          role: 'player',
          player: playerAmount,
          dealer: dealerAmount
        };
        stompClient.publish({ destination: '/app/role', body: JSON.stringify(data) });
      }
      const subscription = stompClient.subscribe('/role_amount', (roleForm) => {
        const data = JSON.parse(roleForm.body);
        setPlayerAmount(data.player);
        setDealerAmount(data.dealer);
      });

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [connected, stompClient, playerAmount, dealerAmount]);

  const clickPlayer = () => {
    const data = {
      role: 'player',
      player: playerAmount,
      dealer: dealerAmount
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/role', body: JSON.stringify(data) });
    }
  };

  const clickDealer = () => {
    const data = {
      role: 'dealer',
      player: playerAmount,
      dealer: dealerAmount
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/role', body: JSON.stringify(data) });
    }
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
