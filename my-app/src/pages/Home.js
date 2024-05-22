import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';

export default function Home() {
  return (
    <Container>
      <Button variant='light' href="/player">player</Button>
      <Button variant='light' href="/dealer">dealer</Button>
    </Container>
  );
}