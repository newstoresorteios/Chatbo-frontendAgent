import type { DashboardTone } from '@/features/dashboard/types';

export function getOperationStatus(waitingQueue: number): 'Saudável' | 'Atenção' | 'Sobrecarregada' {
  if (waitingQueue === 0) return 'Saudável';
  if (waitingQueue <= 5) return 'Atenção';
  return 'Sobrecarregada';
}

export function getOperationTone(operationStatus: ReturnType<typeof getOperationStatus>): DashboardTone {
  if (operationStatus === 'Saudável') return 'green';
  if (operationStatus === 'Atenção') return 'amber';
  return 'red';
}

export function calculatePipelineHealth(retentionRate: number, conversionRate: number, pipelineValue: number): number {
  return Math.max(8, Math.min(100, Math.round((retentionRate + conversionRate + (pipelineValue > 0 ? 25 : 0)) / 2)));
}

export function getPipelineTone(pipelineHealth: number): DashboardTone {
  if (pipelineHealth >= 70) return 'green';
  if (pipelineHealth >= 45) return 'amber';
  return 'red';
}
