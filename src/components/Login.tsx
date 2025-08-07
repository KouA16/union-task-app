
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { Role, Branch, RegionalCouncil } from './types';

interface LoginProps {
  onLogin: (role: Role, id?: string) => void;
  branches: Branch[];
  regionalCouncils: RegionalCouncil[];
}

const HEADQUARTERS_PASSWORD = 'jaed-union';

export const Login: React.FC<LoginProps> = ({ onLogin, branches, regionalCouncils }) => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedRegionalCouncil, setSelectedRegionalCouncil] = useState<string>('');
  const [headquartersPassword, setHeadquartersPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleHeadquartersLogin = () => {
    if (headquartersPassword === HEADQUARTERS_PASSWORD) {
      setError('');
      onLogin('本部');
    } else {
      setError('パスワードが違います。');
    }
  };

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <Row>
        <Col>
          <Card style={{ width: '30rem' }} className="text-center">
            <Card.Header as="h2">高障機構労　統合進捗管理</Card.Header>
            <Card.Body>
              <Card.Title>役割を選択してください</Card.Title>
              <div className="d-grid gap-3 mt-4">
                <Form.Group className="mb-3">
                  <Form.Label>本部パスワード</Form.Label>
                  <Form.Control
                    type="password"
                    value={headquartersPassword}
                    onChange={(e) => setHeadquartersPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleHeadquartersLogin()}
                  />
                </Form.Group>
                <Button variant="primary" size="lg" onClick={handleHeadquartersLogin}>
                  本部としてログイン
                </Button>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                <hr />
                <Form.Select 
                  aria-label="Regional council select"
                  value={selectedRegionalCouncil}
                  onChange={(e) => setSelectedRegionalCouncil(e.target.value)}
                >
                  <option value="">地協を選択してください</option>
                  {regionalCouncils.map(rc => (
                    <option key={rc.id} value={rc.id}>{rc.name}</option>
                  ))}
                </Form.Select>
                <Button 
                  variant="info" 
                  size="lg" 
                  onClick={() => onLogin('地協', selectedRegionalCouncil)}
                  disabled={!selectedRegionalCouncil}
                >
                  地協としてログイン
                </Button>
                <hr />
                <Form.Select 
                  aria-label="Branch select"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="">支部・分会を選択してください</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Form.Select>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => onLogin('支部・分会', selectedBranch)}
                  disabled={!selectedBranch}
                >
                  支部・分会としてログイン
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
