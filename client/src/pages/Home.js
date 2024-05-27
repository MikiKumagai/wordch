import { useEffect, useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useStomp } from './../StompClientContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [playerAmount, setPlayerAmount] = useState(0);
  const [dealerAmount, setDealerAmount] = useState(0);
  const { connected, stompClient } = useStomp();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/role_amount', (roleAmount) => {
        const data = JSON.parse(roleAmount.body);
        if(data.player !==null){
        setPlayerAmount(data.player);
        }
        if(data.dealer !==null){
        setDealerAmount(data.dealer);
        }
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [stompClient, playerAmount, dealerAmount, connected]);

  const clickRole = (role) => {
    const data = {
      role: role,
      player: playerAmount,
      dealer: dealerAmount
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/role', body: JSON.stringify(data) });
    }
  };

  const startGame = () => {
    navigate('/player');
  }

  return (
    <Container>
      <Row>
        <Col>
          <Button variant='light' type="button" onClick={()=>clickRole("player")}>player</Button>
        </Col>
        <Col>
          <h1>player: {playerAmount}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant='light' type="button" onClick={()=>clickRole("dealer")}>dealer</Button>
        </Col>
        <Col>
          <h1>dealer: {dealerAmount}</h1>
        </Col>
      </Row>
      <div>
        Connection status: {connected ? 'Connected' : 'Disconnected'}
      </div>

      <Row>
        <Col>
          <Button variant='light' type="button" onClick={()=>startGame()}>game start!</Button>
        </Col>
      </Row>
    </Container>
  );
}
