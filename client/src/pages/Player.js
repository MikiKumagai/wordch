import { useForm, FormProvider } from 'react-hook-form'
import { Form, Button, Card, Container, Row, Col, Stack } from 'react-bootstrap';
import { useEffect } from 'react';
import { useStomp } from '../StompClientContext';
import { useContext } from "react";
import { GameContext } from "../GameProvider";

export const Player = () => {
  const hookForm = useForm()
  const { register, handleSubmit } = hookForm;
  const { answer, setAnswer, looser, setLooser, winner, setWinner, challenger, setChallenger } 
  = useContext(GameContext);
  const { connected, stompClient } = useStomp();

  useEffect(() => {
    if (connected) {
      // 新しい回答を受信し、回答をストックする
      const subscription = stompClient.subscribe('/topic/answer', (newAnswer) => {
        const data = JSON.parse(newAnswer.body);
        setAnswer((prevAnswer) => [...prevAnswer, data.answer]);
      });
      // 新しい勝者を受信し、敗者と新しい勝者と挑戦者をセットする
      const subscription2 = stompClient.subscribe('/topic/winner', (newWinner) => {
        const data = JSON.parse(newWinner.body);
        if(data.winner === winner){
          setLooser((prevLooser) => [...prevLooser, challenger]);
        }else{
          setWinner(data.winner)
          setLooser((prevLooser) => [...prevLooser, winner]);
        }
        setChallenger(answer[0])
        answer.shift()
      });
      return () => {
        if (subscription) subscription.unsubscribe();
        if (subscription2) subscription2.unsubscribe();
      };
    }
  }, [stompClient, connected, answer, winner, challenger]);

  /**
   * 回答を送信する
   */
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

  /**
   * 勝者を送信する
   */
  const match = (newWinner) => {
    const data = {
      winner: newWinner
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/winner', body: JSON.stringify(data) });
    }
  }

  return (
    <Container>
      <Row>
        <Col>
          <Card className="overflow-scroll" id='card-looser'>
            <Card.Body>
              {looser.map((looser)=>(
              <div key={looser.id} ><p>{looser}</p>
              </div>
              ))}
              </Card.Body>
          </Card>
        </Col>
        <Col>
        <Card>
            <Card.Body>
              <Button type="button" variant="secondary" size="lg" onClick={()=>match(winner)}>
              {winner}
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={()=>match(challenger)}>
              {challenger}
              </Button>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
            {answer.map((answer)=>(
              <div key={answer.id} ><p>{answer}</p>
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
                <Button type="submit" variant="secondary">Submit</Button>
              </Stack>
            </form>
          </FormProvider>
        </Card.Body>
      </Card>
    </Container>
  );
}