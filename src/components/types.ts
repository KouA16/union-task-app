
export interface Task {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  target_type: AssignmentTargetType; // Add this line
}

export interface Branch {
  id: string;
  name: string;
  prefecture: string; // `prefecture` might be equivalent to the branch name itself or a region.
}

export interface RegionalCouncil {
  id: string;
  name: string;
}

export type AssignmentTargetType = 'branch' | 'regional_council';

export interface TaskAssignment {
  target_type: AssignmentTargetType;
  target_id: string;
  assigned_task_ids: string[];
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'done';

export interface Progress {
  target_type: AssignmentTargetType;
  target_id: string;
  task_id: string;
  status: ProgressStatus;
  date?: string;
  note?: string;
}

export type Role = '本部' | '支部・分会' | '地協';

export type ViewMode = 'table' | 'gantt' | 'map' | 'admin';

