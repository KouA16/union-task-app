
import React, { useState } from 'react';
import { Card, Table, Form, Tabs, Tab } from 'react-bootstrap';
import { Branch, RegionalCouncil, Task, TaskAssignment as TaskAssignmentType, AssignmentTargetType } from './types';

interface TaskAssignmentProps {
  branches: Branch[];
  regionalCouncils: RegionalCouncil[];
  branchTasks: Task[];
  regionalCouncilTasks: Task[];
  assignments: TaskAssignmentType[];
  onAssignmentChange: (targetType: AssignmentTargetType, targetId: string, taskId: string, isAssigned: boolean) => void;
}

export const TaskAssignment: React.FC<TaskAssignmentProps> = ({ branches, regionalCouncils, branchTasks, regionalCouncilTasks, assignments, onAssignmentChange }) => {
  const [activeTab, setActiveTab] = useState<AssignmentTargetType>('branch');

  const renderAssignmentTable = (targetType: AssignmentTargetType) => {
    const targets = targetType === 'branch' ? branches : regionalCouncils;
    const tasksToDisplay = targetType === 'branch' ? branchTasks : regionalCouncilTasks;

    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>{targetType === 'branch' ? '支部・分会名' : '地協名'}</th>
            {tasksToDisplay.map(task => <th key={task.id} className="text-center">{task.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {targets.map(target => (
            <tr key={target.id}>
              <td>{target.name}</td>
              {tasksToDisplay.map(task => {
                const isAssigned = assignments
                  .find(a => a.target_type === targetType && a.target_id === target.id)?.assigned_task_ids.includes(task.id) || false;
                return (
                  <td key={task.id} className="text-center">
                    <Form.Check 
                      type="checkbox" 
                      checked={isAssigned}
                      onChange={(e) => onAssignmentChange(targetType, target.id, task.id, e.target.checked)}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Card>
      <Card.Header as="h3">タスク割当</Card.Header>
      <Card.Body>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k as AssignmentTargetType)} id="assignment-tabs" className="mb-3">
          <Tab eventKey="branch" title="支部・分会" />
          <Tab eventKey="regional_council" title="地協" />
        </Tabs>
        {renderAssignmentTable(activeTab)}
      </Card.Body>
    </Card>
  );
};
