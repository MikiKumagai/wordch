import { useEffect, useState, useContext } from 'react';
import { Button, Container, Card, Row, Col } from 'react-bootstrap';
import { useStomp } from './../StompClientContext';
import { useNavigate } from 'react-router-dom';
import { GameContext } from "../GameProvider";

export default function Home() {
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState(null);
  const [role, setRole] = useState(null);
  const { connected, stompClient } = useStomp();
  const { user } = useContext(GameContext);
  const navigate = useNavigate();

  const { prepared, roomId } 
  = useContext(GameContext);

  /**
   * ゲームの親子を割り振る
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/role_amount/' + roomId, (roleAmount) => {
        const data = JSON.parse(roleAmount.body);
        setPlayer(data.playerList)
        setDealer(data.dealer)
        if(user === data.dealer){
          setRole("dealer")
        }else if(data.playerList.includes(user)){
          setRole("player")
        }else{
          setRole(null)
        }
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, [stompClient, player, dealer, connected]);

  /**
   * 役割を選択する
   */
  const clickRole = (role) => {
    const data = {
      role: role,
      user: user,
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/role/' + roomId, body: JSON.stringify(data) });
    }
  }

  /**
   * ゲームを開始する
   */
  const startGame = () => {
    if(role === "dealer"){
      navigate('/dealer');
    }else if(role === "player"){
      navigate('/player');
    }else{}
  }

  return (
    <Container>
      <Card>
        <Card.Body className='p-4'>
          <Row>
            <Col className='text-center'>
              <Button variant='light' size="lg" type="button" onClick={()=>clickRole("dealer")}>親</Button>
            </Col>
            <Col className='text-center'>
              <Button variant='light' size="lg" type="button" onClick={()=>clickRole("player")}>子</Button>
            </Col>
            </Row>
          <Row>
            <Col className='text-center'>
                <h4>{dealer}</h4>
            </Col>
            <Col className='text-center'>
              {player && player.map((player, index)=>(
                <h4 key={index} className='my-2'>{player}</h4>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row>
        <Col className='text-end me-4'>
          <Button variant='light' type="button" onClick={()=>startGame()}>ゲーム画面へ</Button>
        </Col>
      </Row>
    </Container>
  );
}
