export type Report = {
  id: string;
  plant_code: string;
  period_start: string;
  period_end: string;
  record_count: number;
  validation_status: 'VALID' | 'NEEDS_REVIEW' | 'INVALID';
  kpi_data: {
    target_units?: number;
    produced_units?: number;
    good_units?: number;
    target_attainment?: number;
    quality_rate?: number;
    production_gap?: number;
    downtime_minutes?: number;
  };
  exceptions_data: Array<{
    record_id: string;
    production_line_id: string;
    shift: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
  }>;
  report_text: string | null;
  created_at: string;
};
