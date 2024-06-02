import { Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStomp } from './../StompClientContext';
import { useForm, FormProvider } from 'react-hook-form';
import { Stack, Form } from 'react-bootstrap';
import { GameContext } from "../GameProvider";
import { useContext, useState } from 'react';
import Api from '../common/Api';

export default function Landing() {
  const [uuid, setUuid] = useState('');
  const navigate = useNavigate();
  const { connect, disconnect, connected } = useStomp();
  const { setUser } = useContext(GameContext);
  const hookForm = useForm();
  const {
    register,
    handleSubmit,
  } = hookForm;

  /**
   * 部屋IDを作成する
   */
  const createRoom = () => {
    Api.get('/api/room/create', (data)=>setUuid(data))
  }

  /**
   * ユーザー名をセットし、接続する
   */
  const onSubmit = (data) => {
    setUser(data.name);
    connect();
    navigate('/home');
  }

  return (
    <Container>
      <Card>
        <Card.Body>
          {uuid === "" ?
            <Button variant='secondary' onClick={()=>createRoom()}>
              create room
            </Button>
          :
            <div>roomID: {uuid}</div>
          }
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={2}>
                <Form.Control {...register("roomId")} type="text" className="me-auto" placeholder='roomID' />
                <Form.Control {...register("name")} type="text" className="me-auto" defaultValue="noName" />
                <Button type="submit" variant="secondary">Connect</Button>
                <Button type="button" variant="secondary" onClick={() => disconnect()}>Disconnect</Button>
              </Stack>
            </form>
          </FormProvider>
          <div>
            Connection status: {connected ? 'Connected' : 'Disconnected'}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}