import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button, Card, Tabs, Tab } from 'react-bootstrap';
import './App.css';
import { Login } from './components/Login';
import { AdminLogin } from './components/AdminLogin';
import { TaskMaster } from './components/TaskMaster';
import { TaskAssignment } from './components/TaskAssignment';
import { ProgressTable } from './components/ProgressTable';
import { GanttChart } from './components/GanttChart';
import { KanbanBoard } from './components/KanbanBoard';
import { Role, ViewMode, Task, Branch, RegionalCouncil, TaskAssignment as TaskAssignmentType, Progress, AssignmentTargetType } from './components/types';
import { db } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

// Initial Data (will be loaded from Firestore)
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

function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [currentRegionalCouncilId, setCurrentRegionalCouncilId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [adminView, setAdminView] = useState('master');

  const [branchTasks, setBranchTasks] = useState<Task[]>([]);
  const [regionalCouncilTasks, setRegionalCouncilTasks] = useState<Task[]>([]);
  const [branches] = useState<Branch[]>(initialBranches); // Branches are static
  const [regionalCouncils] = useState<RegionalCouncil[]>(initialRegionalCouncils); // Regional Councils are static
  const [assignments, setAssignments] = useState<TaskAssignmentType[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Branch Tasks
      const branchTasksCol = collection(db, 'branchTasks');
      const branchTasksSnapshot = await getDocs(branchTasksCol);
      const loadedBranchTasks = branchTasksSnapshot.docs.map(doc => ({ ...doc.data() as Task, id: doc.id }));
      setBranchTasks(loadedBranchTasks);

      // Fetch Regional Council Tasks
      const rcTasksCol = collection(db, 'regionalCouncilTasks');
      const rcTasksSnapshot = await getDocs(rcTasksCol);
      const loadedRcTasks = rcTasksSnapshot.docs.map(doc => ({ ...doc.data() as Task, id: doc.id }));
      setRegionalCouncilTasks(loadedRcTasks);

      // Fetch Assignments
      const assignmentsCol = collection(db, 'assignments');
      const assignmentsSnapshot = await getDocs(assignmentsCol);
      const loadedAssignments = assignmentsSnapshot.docs.map(doc => ({ ...doc.data() as TaskAssignmentType, id: doc.id }));
      setAssignments(loadedAssignments);

      // Fetch Progress
      const progressCol = collection(db, 'progress');
      const progressSnapshot = await getDocs(progressCol);
      const loadedProgress = progressSnapshot.docs.map(doc => ({ ...doc.data() as Progress, id: doc.id }));
      setProgress(loadedProgress);

      setLoading(false);
    };

    fetchData();
  }, []);

  // Save data to Firestore whenever it changes
  useEffect(() => {
    if (loading) return;

    const saveData = async () => {
      try {
        // Save Branch Tasks
        for (const task of branchTasks) {
          await setDoc(doc(db, 'branchTasks', task.id), task);
        }

        // Save Regional Council Tasks
        for (const task of regionalCouncilTasks) {
          await setDoc(doc(db, 'regionalCouncilTasks', task.id), task);
        }

        // Save Assignments
        for (const assignment of assignments) {
          await setDoc(doc(db, 'assignments', assignment.id || `${assignment.target_type}-${assignment.target_id}`), assignment);
        }

        // Save Progress
        for (const p of progress) {
          const docId = p.id || `${p.task_id}-${p.target_type}-${p.target_id}`;
          await setDoc(doc(db, 'progress', docId), p);
        }
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
      }
    };

    saveData();
  }, [branchTasks, regionalCouncilTasks, assignments, progress, loading]);


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
      const assignmentIndex = prev.findIndex(a => a.target_type === targetType && a.target_id === targetId);
      
      if (assignmentIndex > -1) {
        const newAssignments = [...prev];
        const currentAssignment = newAssignments[assignmentIndex];
        const newAssignedIds = isAssigned
          ? [...currentAssignment.assigned_task_ids, taskId]
          : currentAssignment.assigned_task_ids.filter(id => id !== taskId);
        
        newAssignments[assignmentIndex] = { ...currentAssignment, assigned_task_ids: newAssignedIds };
        return newAssignments;
      } else if (isAssigned) {
        return [...prev, { target_type: targetType, target_id: targetId, assigned_task_ids: [taskId] }];
      }
      
      return prev;
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

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

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

      <Container as="main" className="my-4">
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