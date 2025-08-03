import React, { useState } from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import './App.css';
import { Login } from './components/Login';
import { AdminLogin } from './components/AdminLogin';
import { TaskMaster } from './components/TaskMaster';
import { TaskAssignment } from './components/TaskAssignment';
import { ProgressTable } from './components/ProgressTable';
import { GanttChart } from './components/GanttChart';

import { KanbanBoard } from './components/KanbanBoard'; // Add this line
import { Role, ViewMode, Task, Branch, RegionalCouncil, TaskAssignment as TaskAssignmentType, Progress, AssignmentTargetType } from './components/types';

// Initial Data
const initialBranchTasks: Task[] = [
  { id: 'task01', title: '支部向けタスクA', description: '支部向けタスクAの説明', sort_order: 1, target_type: 'branch' },
  { id: 'task02', title: '支部向けタスクB', description: '支部向けタスクBの説明', sort_order: 2, target_type: 'branch' },
];

const initialRegionalCouncilTasks: Task[] = [
  { id: 'rc_task01', title: '地協向けタスクX', description: '地協向けタスクXの説明', sort_order: 1, target_type: 'regional_council' },
  { id: 'rc_task02', title: '地協向けタスクY', description: '地協向けタスクYの説明', sort_order: 2, target_type: 'regional_council' },
];

const initialBranches: Branch[] = [
    { id: '01', name: '北海道', prefecture: '北海道' }, { id: '02', name: '青森', prefecture: '青森県' },
    { id: '03', name: '岩手', prefecture: '岩手県' }, { id: '04', name: '宮城', prefecture: '宮城県' },
    { id: '05', name: '秋田', prefecture: '秋田県' }, { id: '06', name: '山形', prefecture: '山形県' },
    { id: '07', name: '福島', prefecture: '福島県' }, { id: '08', name: '茨城', prefecture: '茨城県' },
    { id: '09', name: '栃木', prefecture: '栃木県' }, { id: '10', name: '群馬', prefecture: '群馬県' },
    { id: '11', name: '埼玉', prefecture: '埼玉県' }, { id: '12', name: '千葉', prefecture: '千葉県' },
    { id: '13', name: '東京', prefecture: '東京都' }, { id: '14', name: '神奈川', prefecture: '神奈川県' },
    { id: '15', name: '新潟', prefecture: '新潟県' }, { id: '16', name: '富山', prefecture: '富山県' },
    { id: '17', name: '石川', prefecture: '石川県' }, { id: '18', name: '福井', prefecture: '福井県' },
    { id: '19', name: '山梨', prefecture: '山梨県' }, { id: '20', name: '長野', prefecture: '長野県' },
    { id: '21', name: '岐阜', prefecture: '岐阜県' }, { id: '22', name: '静岡', prefecture: '静岡県' },
    { id: '23', name: '愛知', prefecture: '愛知県' }, { id: '24', name: '三重', prefecture: '三重県' },
    { id: '25', name: '滋賀', prefecture: '滋賀県' }, { id: '26', name: '京都', prefecture: '京都府' },
    { id: '27', name: '大阪', prefecture: '大阪府' }, { id: '28', name: '兵庫', prefecture: '兵庫県' },
    { id: '29', name: '奈良', prefecture: '奈良県' }, { id: '30', name: '和歌山', prefecture: '和歌山県' },
    { id: '31', name: '鳥取', prefecture: '鳥取県' }, { id: '32', name: '島根', prefecture: '島根県' },
    { id: '33', name: '岡山', prefecture: '岡山県' }, { id: '34', name: '広島', prefecture: '広島県' },
    { id: '35', name: '山口', prefecture: '山口県' }, { id: '36', name: '徳島', prefecture: '徳島県' },
    { id: '37', name: '香川', prefecture: '香川県' }, { id: '38', name: '愛媛', prefecture: '愛媛県' },
    { id: '39', name: '高知', prefecture: '高知県' }, { id: '40', name: '福岡', prefecture: '福岡県' },
    { id: '41', name: '佐賀', prefecture: '佐賀県' }, { id: '42', name: '長崎', prefecture: '長崎県' },
    { id: '43', name: '熊本', prefecture: '熊本県' }, { id: '44', name: '大分', prefecture: '大分県' },
    { id: '45', name: '宮崎', prefecture: '宮崎県' }, { id: '46', name: '鹿児島', prefecture: '鹿児島県' },
    { id: '47', name: '沖縄', prefecture: '沖縄県' }, { id: '48', name: '旭川', prefecture: '北海道' },
    { id: '49', name: '多摩', prefecture: '東京都' }, { id: '50', name: '豊橋', prefecture: '愛知県' },
    { id: '51', name: '南大阪', prefecture: '大阪府' }, { id: '52', name: '北九州', prefecture: '福岡県' },
    { id: '53', name: '幕張', prefecture: '千葉県' }, { id: '54', name: '所沢', prefecture: '埼玉県' },
    { id: '55', name: '吉備', prefecture: '岡山県' },
].sort((a, b) => a.id.localeCompare(b.id));

const initialRegionalCouncils: RegionalCouncil[] = [
  { id: 'hokkaido', name: '北海道地協' },
  { id: 'tohoku', name: '東北地協' },
  { id: 'kanto', name: '関東地協' },
  { id: 'hokuriku', name: '北陸地協' },
  { id: 'tokai', name: '東海地協' },
  { id: 'kinki', name: '近畿地協' },
  { id: 'chugoku', name: '中国地協' },
  { id: 'shikoku', name: '四国地協' },
  { id: 'kyushu', name: '九州地協' },
];

const initialAssignments: TaskAssignmentType[] = [
  { target_type: 'branch', target_id: '11', assigned_task_ids: ['task01'] }, // Saitama Branch
  { target_type: 'branch', target_id: '13', assigned_task_ids: ['task01', 'task02'] }, // Tokyo Branch
  { target_type: 'regional_council', target_id: 'kanto', assigned_task_ids: ['rc_task01'] }, // Kanto Regional Council
];

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [currentRegionalCouncilId, setCurrentRegionalCouncilId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [adminView, setAdminView] = useState('master');

  const [branchTasks, setBranchTasks] = useState<Task[]>(initialBranchTasks);
  const [regionalCouncilTasks, setRegionalCouncilTasks] = useState<Task[]>(initialRegionalCouncilTasks);
  const [branches] = useState<Branch[]>(initialBranches);
  const [regionalCouncils] = useState<RegionalCouncil[]>(initialRegionalCouncils);
  const [assignments, setAssignments] = useState<TaskAssignmentType[]>(initialAssignments);
  const [progress, setProgress] = useState<Progress[]>([]);

  const handleLogin = (selectedRole: Role, id?: string) => {
    setRole(selectedRole);
    if (selectedRole === '支部・分会') {
      setCurrentBranchId(id || null);
      setCurrentRegionalCouncilId(null);
    } else if (selectedRole === '地協') {
      setCurrentRegionalCouncilId(id || null);
      setCurrentBranchId(null);
    }
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentBranchId(null);
    setCurrentRegionalCouncilId(null);
    setIsAdminAuthenticated(false);
    setShowAdminPanel(false);
  };

  const handleAssignmentChange = (targetType: AssignmentTargetType, targetId: string, taskId: string, isAssigned: boolean) => {
    setAssignments(prev => {
      const otherAssignments = prev.filter(a => !(a.target_type === targetType && a.target_id === targetId));
      const targetAssignment = prev.find(a => a.target_type === targetType && a.target_id === targetId) || { target_type: targetType, target_id: targetId, assigned_task_ids: [] };
      
      let newAssignedIds;
      if (isAssigned) {
        newAssignedIds = [...targetAssignment.assigned_task_ids, taskId];
      } else {
        newAssignedIds = targetAssignment.assigned_task_ids.filter(id => id !== taskId);
      }
      
      return [...otherAssignments, { target_type: targetType, target_id: targetId, assigned_task_ids: newAssignedIds }];
    });
  };

  const renderAdminContent = () => {
    if (role !== '本部') return null;

    if (!showAdminPanel) {
      return (
        <Card className="mb-4">
          <Card.Body className="text-center">
            <Button variant="primary" onClick={() => setShowAdminPanel(true)}>
              管理画面を開く
            </Button>
          </Card.Body>
        </Card>
      );
    }

    if (!isAdminAuthenticated) {
      return <AdminLogin onAuth={handleAdminAuth} />;
    }

    return (
      <Card className="mb-4">
        <Card.Header>
          <Tabs activeKey={adminView} onSelect={(k) => setAdminView(k || 'master')} id="admin-tabs">
            <Tab eventKey="master" title="タスクマスタ管理" />
            <Tab eventKey="assignment" title="タスク割当" />
          </Tabs>
        </Card.Header>
        <Card.Body>
          {adminView === 'master' && (
            <TaskMaster 
              branchTasks={branchTasks} 
              setBranchTasks={setBranchTasks} 
              regionalCouncilTasks={regionalCouncilTasks} 
              setRegionalCouncilTasks={setRegionalCouncilTasks} 
            />
          )}
          {adminView === 'assignment' && (
            <TaskAssignment 
              branches={branches} 
              regionalCouncils={regionalCouncils} 
              branchTasks={branchTasks} 
              regionalCouncilTasks={regionalCouncilTasks} 
              assignments={assignments} 
              onAssignmentChange={handleAssignmentChange} 
            />
          )}
          <div className="text-end mt-3">
            <Button variant="secondary" onClick={() => setShowAdminPanel(false)}>
              編集を終了
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const handleAdminAuth = (isAuthenticated: boolean) => {
    setIsAdminAuthenticated(isAuthenticated);
    if (isAuthenticated) {
      setShowAdminPanel(true);
    }
  };

  if (!role) {
    return <Login onLogin={handleLogin} branches={branches} regionalCouncils={regionalCouncils} />;
  }

  const getTasksForKanban = () => {
    const isBranch = role === '支部・分会';
    const targetId = isBranch ? currentBranchId : currentRegionalCouncilId;
    
    if (!targetId) return [];

    const targetType = isBranch ? 'branch' : 'regional_council';
    const allTasks = isBranch ? branchTasks : regionalCouncilTasks;
    
    const assignment = assignments.find(a => a.target_type === targetType && a.target_id === targetId);
    
    if (!assignment) {
      return [];
    }
    
    return allTasks.filter(task => assignment.assigned_task_ids.includes(task.id));
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">労働組合統合タスク管理アプリ</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" />
            <Navbar.Text className="me-3">ログイン中: {role}{currentBranchId && ` (${branches.find(f=>f.id === currentBranchId)?.name})`}{currentRegionalCouncilId && ` (${regionalCouncils.find(rc => rc.id === currentRegionalCouncilId)?.name})`}</Navbar.Text>
            <Button variant="outline-light" onClick={handleLogout}>ログアウト</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container as="main" fluid className="my-4">
        {renderAdminContent()}

        <Card className="mt-4">
          <Card.Header>
            {role === '本部' && (
              <Nav variant="tabs" activeKey={viewMode} onSelect={(k) => setViewMode(k as ViewMode)}>
                <Nav.Item><Nav.Link eventKey="table">進捗一覧（表形式）</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="gantt">進捗一覧（ガントチャート）</Nav.Link></Nav.Item>
              </Nav>
            )}
            {(role === '支部・分会' || role === '地協') && (
              <Nav variant="tabs">
                <Nav.Item><Nav.Link active>タスクボード</Nav.Link></Nav.Item>
              </Nav>
            )}
          </Card.Header>
          <Card.Body>
            {role === '本部' && (
              <>
                {viewMode === 'table' && <ProgressTable role={role} branchId={currentBranchId} branchTasks={branchTasks} regionalCouncilTasks={regionalCouncilTasks} assignments={assignments} progress={progress} setProgress={setProgress} />}
                {viewMode === 'gantt' && <GanttChart role={role} tasks={[...branchTasks, ...regionalCouncilTasks]} progress={progress} />}
              </>
            )}
            {(role === '支部・分会' || role === '地協') && (
              <KanbanBoard 
                role={role} 
                targetId={role === '支部・分会' ? currentBranchId : currentRegionalCouncilId}
                targetType={role === '支部・分会' ? 'branch' : 'regional_council'}
                tasks={getTasksForKanban()}
                progress={progress} 
                setProgress={setProgress} 
              />
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default App;
