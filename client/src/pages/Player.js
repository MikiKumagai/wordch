import { useForm, FormProvider } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import Countdown from '../common/components/CountDown';

export const Player = () => {
  const hookForm = useForm()
  const { 
    register,
    formState: { errors }, 
    handleSubmit 
  } = hookForm;
  const { answer, loser, winner, challenger, prepared, roomId } 
  = useContext(GameContext);
  const { stompClient } = useStomp();

  /**
   * 回答を送信する
   */
  const onSubmit = () => {
    const formValue = hookForm.getValues()
    const data = {
      answer: formValue.answer
    };
    if (stompClient && stompClient.connected && data.answer !== '') {
      stompClient.publish({ destination: '/app/answer/' + roomId, body: JSON.stringify(data) });
    }
    hookForm.reset()
  }

  return (
    <Container>
    {!prepared ?
    (
      <>
      <Card>
        <Card.Body>
          親がテーマを選択中です…
        </Card.Body>
      </Card>
      </>
    ):( 
      <>
        <Row>
          <Col>
          <Countdown role="player" />
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="overflow-scroll" id='card-loser'>
              <Card.Header>
                <p className='mb-0 text-center'>負け</p>
              </Card.Header>
              <Card.Body>
                {loser.map((loser, index)=>(
                <div key={index} >
                  <p className='my-2'>{loser}</p>
                </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Header>
                <p className='mb-0 text-center'>対戦中</p>
              </Card.Header>
              <Card.Body>
                <h4 className='text-center'>{winner}</h4>
                <p className='text-center m-3'>VS</p>
                <h4 className='text-center'>{challenger}</h4>
              </Card.Body>
            </Card>
            <Card className="overflow-scroll" id='card-answer'>
              <Card.Header>
                <p className='mb-0 text-center'>待ち</p>
              </Card.Header>
              <Card.Body>
              {answer.map((answer, index)=>(
                <div key={index} >
                  <p className='my-2'>{answer}</p>
                </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Card fixed="bottom">
          <Card.Body>
            <FormProvider {...hookForm}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction="horizontal" gap={3}>
                  <Form.Control {...register("answer",{
                    maxLength: { value: 20, message: "20文字までで考えてね！" },
                  })} type="text" className="me-auto" placeholder="ワード" />
                  <Button className='col-auto' type="submit" variant="secondary" disabled={!prepared} >送る</Button>
                </Stack>
              </form>
            </FormProvider>
            {errors.answer && <small className="text-danger text-left">{errors.answer.message}</small>}
          </Card.Body>
        </Card>
      </>
      )
    }
    </Container>
  );
}