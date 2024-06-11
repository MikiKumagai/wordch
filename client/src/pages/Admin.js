import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Table } from 'react-bootstrap';
import Api from '../common/Api';

export const Admin = () => {
  const [themeList, setThemeList] = useState([]);

  useEffect(() => {
    Api.get('/api/admin', (data)=>(setThemeList(data)))
  }
  , []);

  const editTheme = (themeId) => {
    Api.get(`/api/admin/edit/${themeId}`, (data)=>(console.log(data)))
  }

  const deleteTheme = (themeId) => {
    Api.get(`/api/admin/delete/${themeId}`, (data)=>(console.log(data)))
  }

  return (
    <Container className='p-5' style={{ height: '100vh', overflow: 'auto' }}>
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>theme</th>
                <th>active</th>
                <th>edit</th>
                <th>delete</th>
              </tr>
            </thead>
            <tbody>
              {themeList.map((theme, id) => (
                <tr key={id}>
                  <td>{theme.theme}</td>
                  {theme.active ? <td>true</td> : <td style={{color: 'red'}}>false</td>}
                  <td><Button variant='dark' onClick={()=>editTheme(theme.id)}>edit</Button></td>
                  <td><Button variant='danger' onClick={()=>deleteTheme(theme.id)}>delete</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}