import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import { useNavigate } from 'react-router-dom';

export const DealerFinal = () => {
  const { finalAnswerWithUser, finalWinnerWithUser, showTheme, theme, roomId, setFinalAnswerWithUser, 
    setFinalWinnerWithUser, setShowTheme, setPrepared, setAnswer, setWinner, setChallenger, setLoser} 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  const navigate = useNavigate();

  // TODO 全員の回答が揃うのを待つ

  /**
   * 勝者を送信する
   */
  const onSelect = (finalWinner) => {
    const data = {
      finalWinner: finalWinner
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/final/select/' + roomId, body: JSON.stringify(data) });
    }
  }

  /**
   * テーマを表示する
   */
  const displayTheme = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/final/theme/' + roomId, body: true });
    }
  }

  /**
   * 新しいゲームを開始する
   */
  const restartGame = () => {
    setAnswer([])
    setWinner('')
    setChallenger('')
    setFinalAnswerWithUser([])
    setFinalWinnerWithUser('')
    setShowTheme(false)
    setPrepared(false)
    setLoser([])
    navigate('/home')
  }

  return (
    <Container>
      <Card className='py-0'>
        <Card.Body>
          <h3 className='mb-0'>{theme}</h3>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header className='text-center'>みんなのワードが出揃ったら、一番を選んでね</Card.Header>
        <Card.Body>
          {finalWinnerWithUser === '' ?
            finalAnswerWithUser.map((answer) => (
              <>
                <Button variant='dark' size='lg' className='my-1' onClick={() => onSelect(answer)}>
                  {answer}
                </Button>
                <br />
              </>
            )) : (    
              <>
                <h5 className='mt-4'>優勝</h5>
                <h3 className='mb-4'>{finalWinnerWithUser}</h3>
              </>
            )}
        </Card.Body>
      </Card>
      <Row>
        <Col className="text-end me-3">
          {finalWinnerWithUser !== '' && !showTheme &&
            <Button variant='light' disabled={showTheme} onClick={() => displayTheme()}>
              みんなにテーマを見せる
            </Button>
          }
          {showTheme && 
              (
                <Button variant='light' onClick={()=>restartGame()}>
                  次のゲームを始める
                </Button>
              )
            }
        </Col>
      </Row>
    </Container>
  );
}