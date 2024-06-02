import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import { useNavigate } from 'react-router-dom';

export const DealerFinal = () => {
  const { finalAnswerWithUser, finalWinnerWithUser, showTheme, theme, setFinalAnswerWithUser, setFinalWinnerWithUser, setTheme, setShowTheme, prepared, setPrepared} 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  const navigate = useNavigate();

  /**
   * 勝者を送信する
   */
  const onSelect = (finalWinner) => {
    const data = {
      finalWinner: finalWinner
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/final/select', body: JSON.stringify(data) });
    }
  }

  /**
   * テーマを表示する
   */
  const displayTheme = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/final/theme', body: true });
    }
  }

  /**
   * 新しいゲームを開始する
   */
  const restartGame = () => {
    setFinalAnswerWithUser([])
    setFinalWinnerWithUser('')
    setTheme('')
    setShowTheme(false)
    setPrepared(false)
    navigate('/home')
  }

  return (
    <Container>
      <Card>
        <Card.Body>
          <h3>{theme}</h3>
        </Card.Body>
      </Card>
      <Card className='py-3'>
        <Card.Body>
          {finalWinnerWithUser === '' ?
            finalAnswerWithUser.map((answer) => (
              <div>
                <Button variant='outline-dark' size='lg' className='my-1' onClick={() => onSelect(answer)}>
                  {answer}
                </Button>
              </div>
            )) : <h4>winner : {finalWinnerWithUser}</h4>
          }
        </Card.Body>
      </Card>
      <Row>
        <Col className="text-end me-4">
          {finalWinnerWithUser !== '' && !showTheme &&
            <Button variant='secondary' disabled={showTheme} onClick={() => displayTheme()}>
              show theme
            </Button>
          }
          {showTheme && 
              (
                <Button variant='light' onClick={()=>restartGame()}>
                  restart game
                </Button>
              )
            }
        </Col>
      </Row>
    </Container>
  );
}