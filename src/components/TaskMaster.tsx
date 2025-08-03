
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { Task, AssignmentTargetType } from './types';
import Papa from 'papaparse';

interface TaskMasterProps {
  branchTasks: Task[];
  setBranchTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  regionalCouncilTasks: Task[];
  setRegionalCouncilTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const TaskMaster: React.FC<TaskMasterProps> = ({ 
  branchTasks, 
  setBranchTasks, 
  regionalCouncilTasks, 
  setRegionalCouncilTasks 
}) => {
  const [activeTab, setActiveTab] = useState<AssignmentTargetType>('branch');
  const [editedTasks, setEditedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (activeTab === 'branch') {
      setEditedTasks(JSON.parse(JSON.stringify(branchTasks)));
    } else {
      setEditedTasks(JSON.parse(JSON.stringify(regionalCouncilTasks)));
    }
  }, [activeTab, branchTasks, regionalCouncilTasks]);

  const handleSave = () => {
    if (activeTab === 'branch') {
      setBranchTasks(editedTasks);
    } else {
      setRegionalCouncilTasks(editedTasks);
    }
    alert('タスクマスタを保存しました。');
  };

  const handleTaskChange = (id: string, field: keyof Task, value: string | number) => {
    setEditedTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const handleAddTask = () => {
    setEditedTasks(currentTasks => {
      const maxIdNum = currentTasks.reduce((max, task) => {
        const num = parseInt(task.id.replace(/[^0-9]/g, ''), 10);
        if (isNaN(num)) return max;
        return num > max ? num : max;
      }, 0);
      const newIdNum = maxIdNum + 1;
      const prefix = activeTab === 'branch' ? 'task' : 'rc_task';
      const newId = `${prefix}${String(newIdNum).padStart(2, '0')}`;
      return [
        ...currentTasks,
        { id: newId, title: '', description: '', sort_order: currentTasks.length + 1, target_type: activeTab },
      ];
    });
  };

  const handleDeleteTask = (id: string) => {
    setEditedTasks(currentTasks => currentTasks.filter(task => task.id !== id));
  };

  const handleImportCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importedTasks: Task[] = results.data.map((row: any) => ({
            id: row.id || (activeTab === 'branch' ? `task${Date.now()}` : `rc_task${Date.now()}`),
            title: row.title || '',
            description: row.description || '',
            sort_order: parseInt(row.sort_order, 10) || 0,
            target_type: activeTab,
          }));
          
          const mergedTasks = [...editedTasks];
          importedTasks.forEach(importedTask => {
            const existingIndex = mergedTasks.findIndex(t => t.id === importedTask.id);
            if (existingIndex > -1) {
              mergedTasks[existingIndex] = importedTask; 
            } else {
              mergedTasks.push(importedTask); 
            }
          });
          setEditedTasks(mergedTasks);
          alert('CSVファイルをインポートしました。');
        },
        error: (err) => {
          console.error('CSV parsing error:', err);
          alert('CSVファイルの読み込み中にエラーが発生しました。');
        },
      });
    }
  };

  return (
    <Card>
      <Card.Header>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k as AssignmentTargetType)} id="task-master-tabs">
          <Tab eventKey="branch" title="支部・分会タスク" />
          <Tab eventKey="regional_council" title="地協タスク" />
        </Tabs>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>{activeTab === 'branch' ? '支部・分会タスク' : '地協タスク'}</h3>
          <div>
            <Form.Label htmlFor="csv-upload" className="btn btn-info me-2 mb-0">
              CSVインポート
            </Form.Label>
            <Form.Control
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleImportCsv}
              style={{ display: 'none' }}
            />
            <Button variant="success" onClick={handleSave}>保存</Button>
          </div>
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>タイトル</th>
              <th>説明</th>
              <th>表示順</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {editedTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>
                  <Form.Control
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={task.description}
                    onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={task.sort_order}
                    onChange={(e) => handleTaskChange(task.id, 'sort_order', parseInt(e.target.value, 10) || 0)}
                  />
                </td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteTask(task.id)}>
                    削除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="outline-primary" onClick={handleAddTask}>
          行を追加
        </Button>
      </Card.Body>
    </Card>
  );
};
