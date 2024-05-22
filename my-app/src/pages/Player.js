import { useForm, FormProvider } from 'react-hook-form'
import { useState } from 'react'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';

export default function Player() {
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;
  const [answer, setAnswer] = useState('')
  const [pastAnswers, setPastAnswers] = useState([])

  const onSubmit = () => {
    const formValue = hookForm.getValues()
    setAnswer(formValue.answer)
    setPastAnswers([...pastAnswers, answer])
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
          <Card>
            <Card.Body>
              <h2>{answer}</h2>
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