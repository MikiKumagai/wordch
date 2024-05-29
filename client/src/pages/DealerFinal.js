import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";

export const DealerFinal = () => {
  const { answer, looser, winner, challenger } 
  = useContext(GameContext);
  const { stompClient } = useStomp();

  /**
   * 勝者を送信する
   */
  const match = (newWinner) => {
    const data = {
      winner: newWinner
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/winner', body: JSON.stringify(data) });
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h3>theme</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}