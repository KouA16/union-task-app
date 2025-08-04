
import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Role, Task, Progress } from './types';
Chart.register(...registerables);



interface GanttChartProps {
  role: Role;
  tasks: Task[];
  progress: Progress[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ role, tasks, progress }) => {
  // 各組織の完了タスク数を集計
  const completedTasksByTarget: { [key: string]: number } = {};
  const targetNames: { [key: string]: string } = {}; // targetId と表示名のマッピング

  progress.forEach(p => {
    if (p.status === 'done') {
      const task = tasks.find(t => t.id === p.task_id);
      if (task) {
        const targetKey = `${p.target_type}-${p.target_id}`;
        completedTasksByTarget[targetKey] = (completedTasksByTarget[targetKey] || 0) + 1;
        // ここでは仮にtargetIdをそのまま表示名として使用しますが、
        // 実際にはtargetIdから組織名を取得するロジックが必要です。
        // 例: targetIdがユーザーIDならユーザー名、支部IDなら支部名など
        targetNames[targetKey] = p.target_id; 
      }
    }
  });

  const labels = Object.keys(completedTasksByTarget).map(key => targetNames[key]);
  const dataValues = Object.values(completedTasksByTarget);

  const data = {
    labels: labels,
    datasets: [
      {
        label: '完了タスク数',
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '完了タスク数',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Card>
      <Card.Header as="h3">支部・分会・地協の完了タスク進捗</Card.Header>
      <Card.Body>
        <div style={{ height: '400px' }}> {/* チャートの高さ調整 */}
          <Bar data={data} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
};
