
import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Role, Task, Progress, TaskAssignment, Branch, RegionalCouncil } from './types';
Chart.register(...registerables);

interface GanttChartProps {
  role: Role;
  tasks: Task[];
  progress: Progress[];
  assignments: TaskAssignment[];
  branches: Branch[];
  regionalCouncils: RegionalCouncil[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ role, tasks, progress, assignments, branches, regionalCouncils }) => {
  // 組織ごとの進捗率を計算
  const calculateProgress = () => {
    const progressData: { [key: string]: { total: number; done: number } } = {};

    // 1. 全組織の進捗データを初期化
    [...branches, ...regionalCouncils].forEach(org => {
      progressData[org.id] = { total: 0, done: 0 };
    });

    // 2. 割り当てられたタスク総数を計算
    assignments.forEach(assignment => {
      const orgId = assignment.target_id;
      if (progressData[orgId]) {
        progressData[orgId].total = assignment.assigned_task_ids.length;
      }
    });

    // 3. 完了したタスク数を計算
    progress.forEach(p => {
      if (p.status === 'done') {
        const orgId = p.target_id;
        if (progressData[orgId]) {
          progressData[orgId].done += 1;
        }
      }
    });

    // 4. 進捗率を計算
    const labels: string[] = [];
    const dataValues: number[] = [];

    // 組織名マップを作成
    const branchMap = new Map(branches.map(b => [b.id, b.name]));
    const councilMap = new Map(regionalCouncils.map(rc => [rc.id, rc.name]));

    for (const orgId in progressData) {
      const orgProgress = progressData[orgId];
      if (orgProgress.total > 0) {
        const percentage = (orgProgress.done / orgProgress.total) * 100;
        const orgName = branchMap.get(orgId) || councilMap.get(orgId) || orgId;
        labels.push(orgName);
        dataValues.push(percentage);
      }
    }
    
    return { labels, dataValues };
  };

  const { labels, dataValues } = calculateProgress();

  const data = {
    labels: labels,
    datasets: [
      {
        label: '進捗率 (%)',
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        max: 100, // 進捗率なので最大値を100に設定
        title: {
          display: true,
          text: '進捗率 (%)',
        },
        ticks: {
          callback: function(value: string | number) {
            return value + '%';
          }
        }
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <Card>
      <Card.Header as="h3">支部・分会・地協のタスク進捗率</Card.Header>
      <Card.Body>
        <div style={{ height: '600px' }}> {/* 高さを調整して見やすくする */}
          <Bar data={data} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
};
