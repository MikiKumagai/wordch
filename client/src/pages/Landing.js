import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStomp } from './../StompClientContext';
import { useForm, FormProvider } from 'react-hook-form';
import { Stack, Form } from 'react-bootstrap';
import { GameContext } from "../GameProvider";
import { useContext, useEffect, useState } from 'react';

export default function Landing() {
  const [newRoomId, setNewRoomId] = useState('');
  const navigate = useNavigate();
  const { connect, disconnect } = useStomp();
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
  const createRoomId = () => {
    const randomString = Math.random().toString(32).substring(2, 10)
    setNewRoomId(randomString)
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
          {errors.roomId && <><small className="text-danger text-left">{errors.roomId.message}</small><br /></>}
          {errors.name && <small className="text-danger text-left">{errors.name.message}</small>}
          <FormProvider {...hookForm}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction="horizontal" gap={2}>
                <Form.Control {...register("roomId", {
                  required: "部屋IDを入力してね！",
                  maxLength: { value: 8, message: "部屋IDは8文字以内にしてね！" },
                  })} type="text" className="me-auto" placeholder='グループの部屋ID' 
                />
                <Form.Control {...register("name", {
                  required: "名前を入力してね！",
                  maxLength: { value: 8, message: "名前は8文字以内に決めてね！" },
                  })} type="text" className="me-auto" placeholder='あなたの名前' 
                />
                <Button type="submit" variant="outline-dark" className='col-auto'>始める</Button>
              </Stack>
            </form>
          </FormProvider>
          <Row>
            <Col className='my-1'>
              {newRoomId === "" ?
                <Button variant='secondary' size="sm" onClick={()=>createRoomId()}>
                  部屋IDを生成
                </Button>
              :
                <div>部屋ID: {newRoomId}</div>
              }
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}