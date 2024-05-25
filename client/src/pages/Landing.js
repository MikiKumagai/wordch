import { Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useStompClient from './../common/useStompClient';

export default function Landing() {
  const navigate = useNavigate();
  const YOUR_TOKEN = 'YOUR_TOKEN';
  const { connect, disconnect, connected } = 
  useStompClient('http://localhost:8080/gs-guide-websocket', YOUR_TOKEN);

  return (
    <Container>
      <Card>
        <Card.Body>
          <Button type="button" variant="secondary" onClick={() => { connect(); navigate('/home'); }}>
            Connect
          </Button>
          <Button type="button" variant="secondary" onClick={() => disconnect()}>
            Disconnect
          </Button>
          <div>
            Connection status: {connected ? 'Connected' : 'Disconnected'}
          </div>
          {/* <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={3}>
                <Form.Control {...register("password")} type="text" className="me-auto" placeholder="password" />
                <Button type="submit" variant="secondary">Connect</Button>
              </Stack>
            </form>
          </FormProvider> */}
        </Card.Body>
      </Card>
    </Container>
  );
}