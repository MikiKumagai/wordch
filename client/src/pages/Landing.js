import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStomp } from './../StompClientContext';
import { useForm, FormProvider } from 'react-hook-form';
import { Stack, Form } from 'react-bootstrap';
import { GameContext } from "../GameProvider";
import { useContext, useEffect, useState } from 'react';
import Api from '../common/Api';

export default function Landing() {
  const [uuid, setUuid] = useState('');
  const navigate = useNavigate();
  const { connect, disconnect, connected } = useStomp();
  const { setUser, setRoomId } = useContext(GameContext);
  const hookForm = useForm();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = hookForm;

  useEffect(() => {
    disconnect();
  }
  ,[])

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
    setRoomId(data.roomId);
    connect();
    navigate('/home');
  }

  return (
    <Container>
      <Card>
        <Card.Body>
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={2}>
                <Form.Control {...register("roomId", {
                  required: "必須",
                  minLength: { value: 8, message: "8文字" },
                  maxLength: { value: 8, message: "8文字" },
                  })} type="text" className="me-auto" placeholder='部屋ID' 
                />
                {errors.roomId && <small className="text-danger text-left">{errors.roomId.message}</small>}
                <Form.Control {...register("name", {
                  required: "必須",
                  maxLength: { value: 8, message: "8文字以内" },
                  })} type="text" className="me-auto" placeholder='名前を入力' 
                />
                {errors.name && <small className="text-danger text-left">{errors.name.message}</small>}
                <Button type="submit" variant="secondary" className='col-auto'>始める</Button>
              </Stack>
            </form>
          </FormProvider>
          <Row>
            <Col className='my-1'>
              {uuid === "" ?
                <Button variant='secondary' onClick={()=>createRoom()}>
                  新しく部屋をつくる
                </Button>
              :
                <div>部屋ID: {uuid}</div>
              }
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}