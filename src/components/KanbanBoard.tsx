
import React from 'react';
import { Card, Col, Row, ProgressBar } from 'react-bootstrap';
import { Task, Progress, ProgressStatus, Role, AssignmentTargetType } from './types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface KanbanBoardProps {
  role: Role;
  targetId: string | null;
  targetType: AssignmentTargetType;
  tasks: Task[];
  progress: Progress[];
  setProgress: (progress: Progress[]) => void;
}

const statusMap: { [key in ProgressStatus]: string } = {
  not_started: '未着手',
  in_progress: '作業中',
  done: '完了',
};

const statusSequence: ProgressStatus[] = ['not_started', 'in_progress', 'done'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ role, targetId, targetType, tasks, progress, setProgress }) => {

  if (!tasks || tasks.length === 0) {
    return <p className="text-center">割り当てられたタスクはありません。</p>;
  }

  const getTaskStatus = (taskId: string): ProgressStatus => {
    const p = progress.find(pr => pr.task_id === taskId && pr.target_id === targetId && pr.target_type === targetType);
    return p ? p.status : 'not_started';
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as ProgressStatus;

    const existingProgressIndex = progress.findIndex(p => p.task_id === taskId && p.target_id === targetId && p.target_type === targetType);
    
    let newProgress;
    if (existingProgressIndex > -1) {
      newProgress = [...progress];
      newProgress[existingProgressIndex] = { ...newProgress[existingProgressIndex], status: newStatus, date: new Date().toISOString() };
    } else if (targetId) {
      newProgress = [...progress, {
        target_type: targetType,
        target_id: targetId,
        task_id: taskId,
        status: newStatus,
        date: new Date().toISOString()
      }];
    } else {
      return; // Cannot change progress if targetId is not set
    }
    setProgress(newProgress);
  };

  // 進捗バーの計算
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => getTaskStatus(task.id) === 'done').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <h4 className="mt-4">全体の進捗: {progressPercentage}%</h4>
      <ProgressBar now={progressPercentage} label={`${progressPercentage}%`} className="mb-4" />
      <DragDropContext onDragEnd={onDragEnd}>
        <Row>
          {statusSequence.map(statusKey => (
            <Col key={statusKey} sm={12} md={4}>
              <Card className="h-100">
                <Card.Header className="text-center">{statusMap[statusKey]}</Card.Header>
                <Card.Body>
                  <Droppable droppableId={statusKey}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{ minHeight: '100px' }} // ドロップ領域の最小高さを確保
                      >
                        {tasks.filter(task => getTaskStatus(task.id) === statusKey).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-3"
                              >
                                <Card.Body>
                                  <Card.Title>{task.title}</Card.Title>
                                  <Card.Text>{task.description}</Card.Text>
                                </Card.Body>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </DragDropContext>
    </>
  );
};
