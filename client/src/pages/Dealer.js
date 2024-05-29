import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import Countdown from '../common/components/CountDown';

export const Dealer = () => {
  const { answer, looser, winner, challenger, prepared } 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  

  /**
   * 準備完了を送信する
   */
  const clickPrepared = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/prepared', body: true });
    }
  }

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
        {prepared ? <Countdown role="dealer" /> : <Button variant='secondary' type="button" onClick={()=>clickPrepared()}>ok</Button>}
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h3>theme</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="overflow-scroll" id='card-looser'>
            <Card.Body>
              {looser.map((looser)=>(
              <div key={looser.id} ><p>{looser}</p>
              </div>
              ))}
              </Card.Body>
          </Card>
        </Col>
        <Col>
        <Card>
            <Card.Body>
              <Button type="button" variant="secondary" size="lg" 
                disabled={!prepared || challenger === undefined} onClick={()=>match(winner)}>
              {winner}
              </Button>
              <Button type="button" variant="secondary" size="lg" 
                disabled={!prepared || challenger === undefined} onClick={()=>match(challenger)}>
              {challenger}
              </Button>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
            {answer.map((answer)=>(
              <div key={answer.id} ><p>{answer}</p>
              </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}