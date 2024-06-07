import { useForm, FormProvider } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import { useNavigate } from 'react-router-dom';

export const PlayerFinal = () => {
  const hookForm = useForm()
  const { 
    register, 
    formState: { errors }, 
    handleSubmit 
 } = hookForm;
  const { finalAnswerWithUser, finalWinnerWithUser, showTheme, theme, user, roomId,
    setFinalAnswerWithUser, setFinalWinnerWithUser, setShowTheme, setPrepared, 
    setAnswer, setWinner, setChallenger} 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * 回答を送信する
   */
  const onSubmit = () => {
    setIsSubmitted(true)
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
        <Card.Header>
          <p className='mb-0 text-center'>最後のワードを送ってね</p>
        </Card.Header>
        <Card.Body>
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={3}>
                <Form.Control {...register("answer",{
                  maxLength: { value: 20, message: "20文字までで考えてね！" },
                })} type="text" className="me-auto" placeholder="最後のワード" disabled={isSubmitted} />
                <Button className='col-auto' type="submit" variant="secondary" disabled={isSubmitted}>送る</Button>
              </Stack>
            </form>
          </FormProvider>
          {errors.answer && <small className="text-danger text-left">{errors.answer.message}</small>}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          {finalWinnerWithUser === '' ?
            finalAnswerWithUser.map((answer, index)=>(<h4 key={index}>{answer}</h4>))
          :
          <>
            <h5>優勝</h5>
            <h3>{finalWinnerWithUser}</h3>
          </>
          }
          {showTheme && 
            <>
              <h5 className="mt-5">今回のテーマ</h5>
              <h3>{theme}</h3>
            </>
          }
        </Card.Body>
      </Card>
      {showTheme && 
          (
            <Row>
              <Col className="text-end me-4">
                <Button variant='light' onClick={()=>restartGame()}>
                  次のゲームを始める
                </Button>
              </Col>
            </Row>
          )
        }
    </Container>
  );
}