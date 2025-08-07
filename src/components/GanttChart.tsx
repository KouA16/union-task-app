
import React from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
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

const ChartComponent = ({ data, options }: any) => (
  <div style={{ height: '600px' }}>
    <Bar data={data} options={options} />
  </div>
);

export const GanttChart: React.FC<GanttChartProps> = ({ role, tasks, progress, assignments, branches, regionalCouncils }) => {

  const calculateProgress = (targetType: 'branch' | 'regional_council') => {
    const orgs = targetType === 'branch' ? branches : regionalCouncils;
    const orgMap = new Map(orgs.map(o => [o.id, o.name]));
    const progressData: { [key: string]: { total: number; done: number } } = {};

    orgs.forEach(org => {
      progressData[org.id] = { total: 0, done: 0 };
    });

    assignments
      .filter(a => a.target_type === targetType)
      .forEach(assignment => {
        const orgId = assignment.target_id;
        if (progressData[orgId]) {
          progressData[orgId].total = assignment.assigned_task_ids.length;
        }
      });

    progress
      .filter(p => p.target_type === targetType)
      .forEach(p => {
        if (p.status === 'done') {
          const orgId = p.target_id;
          if (progressData[orgId]) {
            progressData[orgId].done += 1;
          }
        }
      });

    const labels: string[] = [];
    const dataValues: number[] = [];

    for (const orgId in progressData) {
      const orgProgress = progressData[orgId];
      if (orgProgress.total > 0) {
        const percentage = (orgProgress.done / orgProgress.total) * 100;
        labels.push(orgMap.get(orgId) || orgId);
        dataValues.push(percentage);
      }
    }
    
    return { labels, dataValues };
  };

  const branchProgress = calculateProgress('branch');
  const regionalCouncilProgress = calculateProgress('regional_council');

  const commonOptions = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
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

  const branchData = {
    labels: branchProgress.labels,
    datasets: [{
      label: '支部・分会 進捗率 (%)',
      data: branchProgress.dataValues,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const regionalCouncilData = {
    labels: regionalCouncilProgress.labels,
    datasets: [{
      label: '地協 進捗率 (%)',
      data: regionalCouncilProgress.dataValues,
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <Card>
      <Card.Body>
        <Tabs defaultActiveKey="regional_council" id="progress-tabs" className="mb-3">
          <Tab eventKey="regional_council" title="地協のタスク進捗率">
            <ChartComponent data={regionalCouncilData} options={commonOptions} />
          </Tab>
          <Tab eventKey="branch" title="支部・分会のタスク進捗率">
            <ChartComponent data={branchData} options={commonOptions} />
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};
