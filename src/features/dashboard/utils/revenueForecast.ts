export interface RevenueForecastInput {
  pipelineValue: number;
  retentionRate: number;
  conversionRate: number;
  waitingQueue: number;
  ticketMedio: number;
}

export interface RevenueForecastResult {
  conservativeForecast: number;
  probableRate: number;
  probableForecast: number;
  optimisticForecast: number;
}

export function calculateRevenueForecast(input: RevenueForecastInput): RevenueForecastResult {
  const probableRate = Math.max(0.28, Math.min(0.72, input.retentionRate / 100 || input.conversionRate / 100 || 0.35));
  return {
    conservativeForecast: input.pipelineValue * 0.22,
    probableRate,
    probableForecast: input.pipelineValue * probableRate,
    optimisticForecast: input.pipelineValue * Math.max(probableRate, 0.55) + input.waitingQueue * input.ticketMedio * 0.2,
  };
}
