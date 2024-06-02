import { useForm, FormProvider } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import { useNavigate } from 'react-router-dom';

export const PlayerFinal = () => {
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;
  const { finalAnswerWithUser, finalWinnerWithUser, showTheme, theme, user, roomId,
    setFinalAnswerWithUser, setFinalWinnerWithUser, setShowTheme, setPrepared, 
    setAnswer, setWinner, setChallenger} 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  const navigate = useNavigate();

  /**
   * 回答を送信する
   */
  const onSubmit = () => {
    const formValue = hookForm.getValues();
    const data = {
      finalAnswer: formValue.answer,
      user: user
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/final/' + roomId, body: JSON.stringify(data) });
    }
    hookForm.reset()
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
    navigate('/home')
  }

  return (
    <Container>
      <Card>
        <Card.Body>
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={3}>
                <Form.Control {...register("answer")} type="text" className="me-auto" placeholder="answer" />
                <Button type="submit" variant="secondary">Submit</Button>
              </Stack>
            </form>
          </FormProvider>
        </Card.Body>
      </Card>
      <Card className='py-3'>
        <Card.Body>
          {finalWinnerWithUser === '' ?
            finalAnswerWithUser.map((answer)=>(<h4>{answer}</h4>))
          :
          <h4>winner : {finalWinnerWithUser}</h4>
          }
          {showTheme && <h3>theme : {theme}</h3>}
        </Card.Body>
      </Card>
      {showTheme && 
          (
            <Row>
              <Col className="text-end me-4">
                <Button variant='light' onClick={()=>restartGame()}>
                  restart game
                </Button>
              </Col>
            </Row>
          )
        }
    </Container>
  );
}