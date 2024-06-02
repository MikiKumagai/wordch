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

  const { prepared, setPrepared } 
  = useContext(GameContext);

  /**
   * ゲームの親子を割り振る
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/role_amount', (roleAmount) => {
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
   * 準備完了フラグをセットする
   */
  const clickPrepared = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/prepared', body: true });
    }
  }

  /**
   * 役割を選択する
   */
  const clickRole = (role) => {
    const data = {
      role: role,
      user: user,
      playerList: player,
      dealer: dealer 
    };
    if (stompClient && stompClient.connected) {
      stompClient.publish({ destination: '/app/role', body: JSON.stringify(data) });
    }
  };

  /**
   * ゲームを開始する
   */
  const startGame = () => {
    setPrepared(false);
    if(role === "dealer"){
      navigate('/dealer');
    }else if(role === "player"){
      navigate('/player');
    }else{}
  }

  return (
    <Container>
      {!prepared &&
        <Row>
          <Col className="ms-4">
            <Button variant='secondary' type="button" onClick={()=>clickPrepared()}>Ready</Button>
          </Col>
        </Row>
      }
      <Card>
        <Card.Body className='p-4'>
          <Row>
            <Col className='text-center'>
              <Button variant='light' size="lg" type="button" disabled={!prepared} onClick={()=>clickRole("player")}>player</Button>
            </Col>
            <Col className='text-center'>
              <Button variant='light' size="lg" type="button" disabled={!prepared} onClick={()=>clickRole("dealer")}>dealer</Button>
            </Col>
            </Row>
          <Row>
            <Col className='text-center'>
              {player && player.map((player, index)=>(
                <h4 key={index} className='my-2'>{player}</h4>
              ))}
            </Col>
            <Col className='text-center'>
                <h4>{dealer}</h4>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row>
        <Col className='text-end me-4'>
          <Button variant='light' type="button" onClick={()=>startGame()}>game start!</Button>
        </Col>
      </Row>
    </Container>
  );
}
