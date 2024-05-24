import { useForm, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card, Container, Stack } from 'react-bootstrap';

export default function Login() {
  const navigate = useNavigate()
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;

  const onSubmit = () => {
    navigate('/home')
  }
  
  return (
    <Container>
      <Card>
        <Card.Body>
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={3}>
                <Form.Control {...register("password")} type="text" className="me-auto" placeholder="password" />
                <Button type="submit" variant="secondary">login</Button>
              </Stack>
            </form>
          </FormProvider>
        </Card.Body>
      </Card>
    </Container>
  );
}