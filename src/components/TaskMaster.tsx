
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { Task, AssignmentTargetType } from './types';
import Papa from 'papaparse';

interface TaskMasterProps {
  branchTasks: Task[];
  regionalCouncilTasks: Task[];
  onTaskChange: (task: Task, action: 'add' | 'update' | 'delete') => void;
}

export const TaskMaster: React.FC<TaskMasterProps> = ({ 
  branchTasks, 
  regionalCouncilTasks, 
  onTaskChange 
}) => {
  const [activeTab, setActiveTab] = useState<AssignmentTargetType>('branch');

  const currentTasks = activeTab === 'branch' ? branchTasks : regionalCouncilTasks;

  const handleTaskChange = (task: Task, field: keyof Task, value: string | number) => {
    const updatedTask = { ...task, [field]: value };
    onTaskChange(updatedTask, 'update');
  };

  const handleAddTask = () => {
    const maxIdNum = currentTasks.reduce((max, task) => {
      const num = parseInt(task.id.replace(/[^0-9]/g, ''), 10);
      if (isNaN(num)) return max;
      return num > max ? num : max;
    }, 0);
    const newIdNum = maxIdNum + 1;
    const prefix = activeTab === 'branch' ? 'task' : 'rc_task';
    const newId = `${prefix}${String(newIdNum).padStart(2, '0')}`;
    const newTask: Task = {
      id: newId, 
      title: '新しいタスク', 
      description: '', 
      sort_order: currentTasks.length + 1, 
      target_type: activeTab 
    };
    onTaskChange(newTask, 'add');
  };

  const handleDeleteTask = (task: Task) => {
    if (window.confirm(`タスク「${task.title}」を削除しますか？`)) {
      onTaskChange(task, 'delete');
    }
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
          
          importedTasks.forEach(importedTask => {
            const existingTask = currentTasks.find(t => t.id === importedTask.id);
            onTaskChange(importedTask, existingTask ? 'update' : 'add');
          });
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
            {currentTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>
                  <Form.Control
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskChange(task, 'title', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={task.description}
                    onChange={(e) => handleTaskChange(task, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={task.sort_order}
                    onChange={(e) => handleTaskChange(task, 'sort_order', parseInt(e.target.value, 10) || 0)}
                  />
                </td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteTask(task)}>
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
