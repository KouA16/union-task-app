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
import { collection, getDocs, setDoc, doc, query, where, deleteDoc, getDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(false);

  // Load data based on the current user's role and ID
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Clear all data on logout or if role is not set
      if (!role) {
        setBranchTasks([]);
        setRegionalCouncilTasks([]);
        setAssignments([]);
        setProgress([]);
        setLoading(false);
        return;
      }

      // For Headquarters, load all master data but not progress (will be paginated)
      if (role === '本部') {
        const branchTasksCol = collection(db, 'branchTasks');
        const rcTasksCol = collection(db, 'regionalCouncilTasks');
        const assignmentsCol = collection(db, 'assignments');

        const [branchTasksSnap, rcTasksSnap, assignmentsSnap] = await Promise.all([
          getDocs(branchTasksCol),
          getDocs(rcTasksCol),
          getDocs(assignmentsCol),
        ]);

        setBranchTasks(branchTasksSnap.docs.map(doc => ({ ...doc.data() as Task, id: doc.id })));
        setRegionalCouncilTasks(rcTasksSnap.docs.map(doc => ({ ...doc.data() as Task, id: doc.id })));
        setAssignments(assignmentsSnap.docs.map(doc => ({ ...doc.data() as TaskAssignmentType, id: doc.id })));
        setProgress([]); // Progress will be loaded by the table itself

      } else { // For Branch or Regional Council users
        const targetType = role === '支部・分会' ? 'branch' : 'regional_council';
        const targetId = role === '支部・分会' ? currentBranchId : currentRegionalCouncilId;

        if (!targetId) {
          setLoading(false);
          return;
        }

        // 1. Fetch the specific assignment for the user
        const assignmentRef = doc(db, 'assignments', `${targetType}-${targetId}`);
        const assignmentSnap = await getDoc(assignmentRef);
        
        const assignedTaskIds = assignmentSnap.exists() ? (assignmentSnap.data() as TaskAssignmentType).assigned_task_ids : [];
        setAssignments(assignmentSnap.exists() ? [{ ...assignmentSnap.data() as TaskAssignmentType, id: assignmentSnap.id }] : []);

        // 2. Fetch ALL tasks for the relevant type, then filter by assignedTaskIds in memory
        const tasksColName = targetType === 'branch' ? 'branchTasks' : 'regionalCouncilTasks';
        const allTasksSnap = await getDocs(collection(db, tasksColName)); // Fetch all tasks of this type
        const allLoadedTasks = allTasksSnap.docs.map(doc => ({ ...doc.data() as Task, id: doc.id }));
        
        const loadedTasks = allLoadedTasks.filter(task => assignedTaskIds.includes(task.id)); // Filter in memory
        
        if (targetType === 'branch') {
          setBranchTasks(loadedTasks);
          setRegionalCouncilTasks([]);
        } else {
          setRegionalCouncilTasks(loadedTasks);
          setBranchTasks([]);
        }

        // 3. Fetch only the relevant progress
        const progressQuery = query(collection(db, 'progress'), where('target_type', '==', targetType), where('target_id', '==', targetId));
        const progressSnap = await getDocs(progressQuery);
        setProgress(progressSnap.docs.map(doc => ({ ...doc.data() as Progress, id: doc.id })));
      }

      setLoading(false);
    };

    fetchData();
  }, [role, currentBranchId, currentRegionalCouncilId]);

  


  const handleLogin = (selectedRole: Role, id?: string) => {
    setLoading(true); // Show loading indicator immediately
    setRole(selectedRole);
    if (selectedRole === '支部・分会') {
      setCurrentBranchId(id || null);
      setCurrentRegionalCouncilId(null);
    } else if (selectedRole === '地協') {
      setCurrentRegionalCouncilId(id || null);
      setCurrentBranchId(null);
    } else if (selectedRole === '本部') {
        setCurrentBranchId(null);
        setCurrentRegionalCouncilId(null);
    }
  };

  const handleLogout = () => {
    setLoading(true);
    setRole(null);
    setCurrentBranchId(null);
    setCurrentRegionalCouncilId(null);
    setIsAdminAuthenticated(false);
    setShowAdminPanel(false);
  };

  const handleProgressChange = async (updatedProgress: Progress) => {
    const docId = updatedProgress.id || `${updatedProgress.task_id}-${updatedProgress.target_type}-${updatedProgress.target_id}`;
    const originalProgress = progress.find(p => p.id === docId); // Store original for rollback

    // Optimistic UI Update
    setProgress(prev => {
      const index = prev.findIndex(p => p.id === docId);
      if (index > -1) {
        const newProgress = [...prev];
        newProgress[index] = updatedProgress;
        return newProgress;
      }
      return [...prev, { ...updatedProgress, id: docId }];
    });

    try {
      await setDoc(doc(db, 'progress', docId), updatedProgress, { merge: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      // Rollback UI on error
      if (originalProgress) {
        setProgress(prev => prev.map(p => p.id === docId ? originalProgress : p));
      } else {
        setProgress(prev => prev.filter(p => p.id !== docId));
      }
      alert('進捗の更新に失敗しました。ネットワーク接続を確認してください。');
    }
  };

  const handleAssignmentChange = async (targetType: AssignmentTargetType, targetId: string, taskId: string, isAssigned: boolean) => {
    const assignmentRef = doc(db, 'assignments', `${targetType}-${targetId}`);
    
    const originalAssignments = [...assignments]; // Store original for rollback

    // Optimistic UI Update
    setAssignments(prev => {
      const newAssignments = [...prev];
      const assignmentIndex = newAssignments.findIndex(a => a.target_type === targetType && a.target_id === targetId);

      if (assignmentIndex > -1) {
        const currentAssignment = newAssignments[assignmentIndex];
        const newAssignedIds = isAssigned
          ? [...currentAssignment.assigned_task_ids, taskId]
          : currentAssignment.assigned_task_ids.filter(id => id !== taskId);
        
        newAssignments[assignmentIndex] = { ...currentAssignment, assigned_task_ids: newAssignedIds };
      } else if (isAssigned) {
        const newAssignment = { target_type: targetType, target_id: targetId, assigned_task_ids: [taskId] };
        newAssignments.push(newAssignment);
      }
      return newAssignments;
    });

    try {
      const updatedAssignment = assignments.find(a => a.target_type === targetType && a.target_id === targetId);
      if (updatedAssignment) {
        await setDoc(assignmentRef, updatedAssignment);
      } else if (isAssigned) {
        // This case handles adding a new assignment document
        await setDoc(assignmentRef, { target_type: targetType, target_id: targetId, assigned_task_ids: [taskId] });
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      setAssignments(originalAssignments); // Rollback UI
      alert('割り当ての更新に失敗しました。ネットワーク接続を確認してください。');
    }
  };

  const handleTaskChange = async (task: Task, action: 'add' | 'update' | 'delete') => {
    const collectionName = task.target_type === 'branch' ? 'branchTasks' : 'regionalCouncilTasks';
    const taskRef = doc(db, collectionName, task.id);

    const taskStateSetter = task.target_type === 'branch' ? setBranchTasks : setRegionalCouncilTasks;
    const originalTasks = task.target_type === 'branch' ? [...branchTasks] : [...regionalCouncilTasks]; // Store original for rollback

    // Optimistic UI Update
    taskStateSetter(prev => {
      if (action === 'add') {
        return [...prev, task];
      } else if (action === 'update') {
        return prev.map(t => t.id === task.id ? task : t);
      } else { // delete
        return prev.filter(t => t.id !== task.id);
      }
    });

    try {
      if (action === 'delete') {
        await deleteDoc(taskRef);
      } else {
        await setDoc(taskRef, task);
      }
    } catch (error) {
      console.error(`Error ${action}ing task:`, error);
      taskStateSetter(originalTasks); // Rollback UI
      alert(`タスクの${action === 'add' ? '追加' : action === 'update' ? '更新' : '削除'}に失敗しました。ネットワーク接続を確認してください。`);
    }
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
              regionalCouncilTasks={regionalCouncilTasks} 
              onTaskChange={handleTaskChange} 
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
                {viewMode === 'table' && <ProgressTable role={role} branchId={currentBranchId} branchTasks={branchTasks} regionalCouncilTasks={regionalCouncilTasks} assignments={assignments} progress={progress} onProgressChange={handleProgressChange} />}
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
                onProgressChange={handleProgressChange} 
              />
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default App;