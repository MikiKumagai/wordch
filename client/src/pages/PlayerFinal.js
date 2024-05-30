import { useForm, FormProvider, set } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import { useNavigate } from 'react-router-dom';

export const PlayerFinal = () => {
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;
  const { finalAnswerWithUser, finalWinnerWithUser, showTheme, theme, user, setFinalAnswerWithUser, setFinalWinnerWithUser, setTheme, setShowTheme, setPrepared} 
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
      stompClient.publish({ destination: '/app/final', body: JSON.stringify(data) });
    }
    hookForm.reset()
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
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {finalWinnerWithUser === '' ?
              finalAnswerWithUser:(
                <>
                  <p>winner : </p>
                  {finalWinnerWithUser}
                </>
                )
              }
              {showTheme && 
                (
                  <>
                    {theme}
                    <Button variant='secondary' onClick={()=>restartGame()}>
                      return Home
                    </Button>
                  </>
                )
              }
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card fixed="bottom">
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
    </Container>
  );
}