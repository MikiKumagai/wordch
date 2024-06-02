import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useContext, useEffect } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import Countdown from '../common/components/CountDown';

export const Dealer = () => {
  const { answer, loser, winner, challenger, prepared, theme, themeOptions, setTheme } 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  
  /**
   * テーマ取得のリクエストを送信する
   */
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/start', body: true });
    }
  }
  , [stompClient]);

  /**
   * 準備完了を送信する
   */
  const clickPrepared = (theme) => {
    setTheme(theme);
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
      {theme === '' ? 
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Row>
                  <Col className='text-center'>
                    <Button className='ms-4' variant='outline-dark' type="button" onClick={()=>clickPrepared(themeOptions[0])}>{themeOptions[0]}</Button>
                  </Col>
                  <Col className='text-center'>
                    <Button className='ms-4' variant='outline-dark' type="button" onClick={()=>clickPrepared(themeOptions[1])}>{themeOptions[1]}</Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      :
        <>
          <Row>
            <Col>
              <Countdown role="dealer" /> 
            </Col>
          </Row>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <h3 className='my-2'>{theme}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="overflow-scroll" id='card-loser'>
                <Card.Body>
                  {loser.map((loser)=>(
                    <div key={loser.id} >
                      <p className='my-2'>{loser}</p>
                    </div>
                  ))}
                  </Card.Body>
              </Card>
            </Col>
            <Col>
            <Card>
                <Card.Body className='text-center'>
                  <Button className='my-3' type="button" variant="secondary" size="lg" 
                    disabled={!prepared || challenger === undefined} onClick={()=>match(winner)}>
                    {winner}
                  </Button><br/>
                  <Button className='my-3' type="button" variant="secondary" size="lg" 
                    disabled={!prepared || challenger === undefined} onClick={()=>match(challenger)}>
                    {challenger}
                  </Button>
                </Card.Body>
              </Card>
              <Card className="overflow-scroll" id='card-answer'>
                <Card.Body>
                  {answer.map((answer)=>(
                    <div key={answer.id} >
                      <p className='my-2'>{answer}</p>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      }
    </Container>
  );
}