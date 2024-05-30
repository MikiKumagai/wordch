import { useForm, FormProvider } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useContext } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import Countdown from '../common/components/CountDown';

export const Player = () => {
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;
  const { answer, loser, winner, challenger, prepared } 
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
      stompClient.publish({ destination: '/app/answer', body: JSON.stringify(data) });
    }
    hookForm.reset()
  }

  return (
    <Container>
      <Row>
        <Col>
        {prepared && <Countdown role="player" />}
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
          <Card className='py-3'>
            <Card.Body>
              <h4 className='text-center'>{winner}</h4>
              <p className='text-center m-3'>VS</p>
              <h4 className='text-center'>{challenger}</h4>
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
      <Card fixed="bottom">
        <Card.Body>
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={3}>
                <Form.Control {...register("answer")} type="text" className="me-auto" placeholder="answer" />
                <Button type="submit" variant="secondary" disabled={!prepared} >Submit</Button>
              </Stack>
            </form>
          </FormProvider>
        </Card.Body>
      </Card>
    </Container>
  );
}