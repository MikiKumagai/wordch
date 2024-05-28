import { useEffect, useState, useContext } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useStomp } from './../StompClientContext';
import { useNavigate } from 'react-router-dom';
import { GameContext } from "../GameProvider";

export default function Home() {
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState("");
  const { connected, stompClient } = useStomp();
  const { user } = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/role_amount', (roleAmount) => {
        const data = JSON.parse(roleAmount.body);
        console.log(data);
          setPlayer(data.playerList)
          setDealer(data.dealer)
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [stompClient, player, dealer, connected]);

  const clickRole = (role) => {
    const data = {
      role: role,
      user: user,
      playerList: player,
      dealer: dealer 
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/role', body: JSON.stringify(data) });
    }
  };

  const startGameAsPlayer = () => {
    navigate('/player');
  }

  const startGameAsDealer = () => {
    navigate('/dealer');
  }

  return (
    <Container>
      <h1>{user}</h1>
      <Row>
        <Col>
          <Button variant='light' type="button" onClick={()=>clickRole("player")}>player</Button>
        </Col>
        <Col>
          <h1>player: {player}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant='light' type="button" onClick={()=>clickRole("dealer")}>dealer</Button>
        </Col>
        <Col>
          <h1>dealer: {dealer}</h1>
        </Col>
      </Row>
      <div>
        Connection status: {connected ? 'Connected' : 'Disconnected'}
      </div>

      <Row>
        <Col>
          <Button variant='light' type="button" onClick={()=>startGameAsPlayer()}>game start!</Button>
        </Col>
        <Col>
          <Button variant='light' type="button" onClick={()=>startGameAsDealer()}>game start!</Button>
        </Col>
      </Row>
    </Container>
  );
}
