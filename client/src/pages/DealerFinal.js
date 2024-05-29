import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";

export const DealerFinal = () => {
  const { finalAnswerWithUser, finalWinnerWithUser, theme, user } 
  = useContext(GameContext);
  const { stompClient } = useStomp();

  /**
   * 勝者を送信する
   */
  const onSelect = (finalWinner) => {
    const data = {
      finalWinner: finalWinner,
      user: user
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/final/select', body: JSON.stringify(data) });
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h3>{theme}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {finalWinnerWithUser == null ?
              finalAnswerWithUser.map((answer, index) => (
              <Button onClick={() => onSelect(answer)}>{answer.finalAnswer}{answer.user}</Button>
              )) : finalWinnerWithUser.finalAnswer}
              {finalWinnerWithUser == null ? '' : <p>テーマを見せる</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}