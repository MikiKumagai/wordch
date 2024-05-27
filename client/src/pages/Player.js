import { useForm, FormProvider } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useStomp } from './../StompClientContext';

export default function Player() {
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;
  const [answer, setAnswer] = useState('')
  const [pastAnswers, setPastAnswers] = useState([])
  const { connected, stompClient } = useStomp();

  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/answer', (newAnswer) => {
        const data = JSON.parse(newAnswer.body);
        console.log(data);
        setAnswer(data.answer)
        setPastAnswers([...pastAnswers, data.answer])
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [stompClient, connected, answer]);

  const onSubmit = () => {
    const formValue = hookForm.getValues()
    const data = {
      answer: formValue.answer
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/answer', body: JSON.stringify(data) });
    }
    hookForm.reset()
  }

  return (
    <Container>
      <Row>
        <Col>
          <Card className="overflow-scroll" id='card-looser'>
            <Card.Body>
              {pastAnswers.map((pastAnswer)=>(
              <div key={pastAnswer.id} ><p>{pastAnswer}</p>
              </div>
              ))}
              </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <h2>{answer}</h2>
            </Card.Body>
          </Card>
          <Button className="#out-button" type="button" variant="light" size="lg">
          {answer}
          </Button>
          <Button className="#out-button" type="button" variant="light" size="lg">
          {answer}
          </Button>
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