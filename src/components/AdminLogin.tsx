import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const ADMIN_PASSWORD = 'admin'; // In a real app, use a more secure method

interface AdminLoginProps {
  onAuth: (isAuthenticated: boolean) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAuth }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = () => {
    if (password === ADMIN_PASSWORD) {
      setError('');
      onAuth(true);
    } else {
      setError('パスワードが違います。');
      onAuth(false);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ paddingTop: '5rem' }}>
      <Row>
        <Col>
          <Card style={{ width: '25rem' }}>
            <Card.Header as="h3">管理者認証</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>管理者パスワードを入力してください</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="d-grid">
                <Button variant="primary" onClick={handleAuth}>
                  認証
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};