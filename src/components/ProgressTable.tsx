
import React, { useMemo, useState, useEffect } from 'react';
import { Card, Table, Badge, DropdownButton, Dropdown, Button, Spinner } from 'react-bootstrap';
import { Progress, Role, Task, TaskAssignment, ProgressStatus, AssignmentTargetType } from './types';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

const statusMap: { [key in ProgressStatus]: { variant: string; text: string } } = {
  not_started: { variant: 'secondary', text: '未着手' },
  in_progress: { variant: 'primary', text: '進行中' },
  done: { variant: 'success', text: '完了' },
};

interface ProgressTableProps {
  role: Role;
  branchId: string | null;
  branchTasks: Task[];
  regionalCouncilTasks: Task[];
  assignments: TaskAssignment[];
  progress: Progress[];
  onProgressChange: (progress: Progress) => void;
}

export const ProgressTable: React.FC<ProgressTableProps> = ({ role, branchId, branchTasks, regionalCouncilTasks, assignments, progress: initialProgress, onProgressChange }) => {
  const [paginatedProgress, setPaginatedProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstDoc, setFirstDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);

  const progress = role === '本部' ? paginatedProgress : initialProgress;
  const PAGE_SIZE = 20;

  const fetchProgress = async (direction: 'next' | 'prev' | 'initial' = 'initial') => {
    if (role !== '本部') return;
    setIsLoading(true);

    let progressQuery;
    if (direction === 'next' && lastDoc) {
      progressQuery = query(collection(db, 'progress'), orderBy('target_type'), orderBy('target_id'), startAfter(lastDoc), limit(PAGE_SIZE));
    } else if (direction === 'prev' && firstDoc) {
      progressQuery = query(collection(db, 'progress'), orderBy('target_type'), orderBy('target_id'), endBefore(firstDoc), limitToLast(PAGE_SIZE));
    } else {
      progressQuery = query(collection(db, 'progress'), orderBy('target_type'), orderBy('target_id'), limit(PAGE_SIZE));
    }

    try {
      const snapshot = await getDocs(progressQuery);
      const loadedProgress = snapshot.docs.map(doc => ({ ...doc.data() as Progress, id: doc.id }));
      setPaginatedProgress(loadedProgress);
      setFirstDoc(snapshot.docs[0] || null);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setIsLastPage(snapshot.docs.length < PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (role === '本部') {
      fetchProgress('initial');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const filteredAssignments = useMemo(() => {
    if (role === '本部') {
      return assignments;
    } else if (role === '支部・分会' && branchId) {
      return assignments.filter(a => a.target_type === 'branch' && a.target_id === branchId);
    } else if (role === '地協') {
      // For regional council, we need to determine which regional council they belong to
      // For now, we'll just show all regional council assignments if logged in as one.
      // In a real app, this would involve mapping branches to regional councils.
      return assignments.filter(a => a.target_type === 'regional_council');
    }
    return [];
  }, [role, branchId, assignments]);

  const displayTasks = useMemo(() => {
    const allTasks = [...branchTasks, ...regionalCouncilTasks];
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    let allAssignedTasks: { target_type: AssignmentTargetType; target_id: string; task: Task }[] = [];

    filteredAssignments.forEach(assignment => {
      assignment.assigned_task_ids.forEach(taskId => {
        const task = taskMap.get(taskId);
        if (task && task.target_type === assignment.target_type) { // Ensure task type matches assignment type
          allAssignedTasks.push({ target_type: assignment.target_type, target_id: assignment.target_id, task });
        }
      });
    });

    return allAssignedTasks.sort((a, b) => a.task.sort_order - b.task.sort_order);
  }, [branchTasks, regionalCouncilTasks, filteredAssignments]);

  const handleStatusChange = (target_type: AssignmentTargetType, target_id: string, task_id: string, status: ProgressStatus) => {
    const existingProgress = progress.find(p => p.target_type === target_type && p.target_id === target_id && p.task_id === task_id);
    const newProgress: Progress = {
      id: existingProgress?.id || `${task_id}-${target_type}-${target_id}`,
      target_type,
      target_id,
      task_id,
      status,
      ...(status === 'done' && { date: new Date().toISOString().split('T')[0] }),
    };
    onProgressChange(newProgress);
  };

  return (
    <Card>
      <Card.Header as="h3">進捗一覧</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {role === '本部' && <th>対象タイプ</th>}
              {role === '本部' && <th>対象ID</th>}
              <th>タスク名</th>
              <th>ステータス</th>
              <th>完了日</th>
              <th>メモ</th>
              {(role === '支部・分会' || role === '地協') && <th>操作</th>}
            </tr>
          </thead>
          <tbody>
            {displayTasks.map(({ target_type, target_id, task }) => {
              const currentProgress: Progress = progress.find(p => p.target_type === target_type && p.target_id === target_id && p.task_id === task.id) || { target_type, target_id, task_id: task.id, status: 'not_started' };
              return (
                <tr key={`${target_type}-${target_id}-${task.id}`}>
                  {role === '本部' && <td>{target_type === 'branch' ? '支部・分会' : '地協'}</td>}
                  {role === '本部' && <td>{target_id}</td>}
                  <td>{task.title}</td>
                  <td>
                    <Badge bg={statusMap[currentProgress.status].variant}>{statusMap[currentProgress.status].text}</Badge>
                  </td>
                  <td>{currentProgress.date}</td>
                  <td>{currentProgress.note}</td>
                  {(role === '支部・分会' || role === '地協') && (
                    <td>
                      <DropdownButton title="ステータス変更" variant="outline-primary" size="sm">
                        {Object.keys(statusMap).map(s => (
                          <Dropdown.Item key={s} onClick={() => handleStatusChange(target_type, target_id, task.id, s as ProgressStatus)}>
                            {statusMap[s as ProgressStatus].text}
                          </Dropdown.Item>
                        ))}
                      </DropdownButton>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
        {role === '本部' && (
          <div className="d-flex justify-content-center align-items-center mt-3">
            <Button onClick={() => fetchProgress('prev')} disabled={isLoading || !firstDoc} className="me-2">前へ</Button>
            {isLoading && <Spinner animation="border" size="sm" />}
            <Button onClick={() => fetchProgress('next')} disabled={isLoading || isLastPage}>次へ</Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
