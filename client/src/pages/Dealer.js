import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { useStomp } from '../StompClientContext';
import { GameContext } from "../GameProvider";
import Countdown from '../common/components/CountDown';
import { useForm, FormProvider } from 'react-hook-form';

export const Dealer = () => {
  const { answer, loser, winner, challenger, prepared, theme, themeOptions, roomId } 
  = useContext(GameContext);
  const { stompClient } = useStomp();
  const [ inputTheme, setInputTheme ] = useState(false);
  const hookForm = useForm();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = hookForm;
  
  /**
   * テーマ取得のリクエストを送信する
   */
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/start/' + roomId, body: true });
    }
  }
  , [stompClient]);

  /**
   * 準備完了を送信する
   */
  const clickPrepared = (theme) => {
    if (stompClient && stompClient.connected) {
      if (theme && typeof theme === 'object' && theme !== null){
        const postData = {
          theme: theme.theme,
          isUserInput: true
        }
        stompClient.publish({ destination: '/app/prepared/' + roomId, body: JSON.stringify(postData) });
      } else {
        const postData = {
          theme: theme,
          isUserInput: false
        }
        stompClient.publish({ destination: '/app/prepared/' + roomId, body: JSON.stringify(postData) });
      }
      setInputTheme(false);
      hookForm.reset();
    }
  }

  /**
   * 勝者を送信する
   */
  const match = (newWinner) => {
    const data = {
      winner: newWinner
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/winner/' + roomId, body: JSON.stringify(data) });
    }
  }

  return (
    <Container>
      {!prepared ? 
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <p className='mb-0 text-center'>テーマを選択してください</p>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col className='text-center'>
                    <Button variant='outline-dark' type="button" onClick={()=>clickPrepared(themeOptions[0])}>{themeOptions[0]}</Button>
                  </Col>
                  <Col className='text-center'>
                    <Button variant='outline-dark' type="button" onClick={()=>clickPrepared(themeOptions[1])}>{themeOptions[1]}</Button>
                  </Col>
                </Row>
                <Row>
                  <Col className='text-center'>
                    {!inputTheme ? (
                      <Button variant='outline-dark' type="button" onClick={()=>setInputTheme(true)}>自分で決める</Button>
                    ):(
                      <FormProvider {...hookForm}>
                        <form onSubmit={handleSubmit(clickPrepared)}>
                          <Row>
                            <Col>
                              <Form.Control {...register("theme")} type="text" className="me-auto" />
                            </Col>
                            <Col>
                              <Button type="submit" variant="outline-dark" className='col-auto'>送る</Button>
                            </Col>
                          </Row>
                        </form>
                    </FormProvider>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      :
        <>
          <Row>
            <Col>
              <Countdown role="dealer" /> 
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className='py-0'>
                <Card.Body>
                  <h3 className='mb-0'>{theme}</h3>
                </Card.Body>
              </Card>
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
                <p className='mb-0 text-center'>どっち？</p>
              </Card.Header>
              <Card.Body className='text-center'>
                <Button className='my-3' type="button" variant="outline-dark" size="lg" 
                  disabled={!prepared || challenger === undefined} onClick={()=>match(winner)}>
                  {winner}
                </Button><br/>
                <Button className='my-3' type="button" variant="outline-dark" size="lg" 
                  disabled={!prepared || challenger === undefined} onClick={()=>match(challenger)}>
                  {challenger}
                </Button>
              </Card.Body>
              </Card>
              <Card className="overflow-scroll" id='card-answer'>
              <Card.Header>
                <p className='mb-0 text-center'>待ち</p>
              </Card.Header>
                <Card.Body>
                  {answer.map((answer,index)=>(
                    <div key={index} >
                      <p className='my-2'>{answer}</p>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      }
    </Container>
  );
}