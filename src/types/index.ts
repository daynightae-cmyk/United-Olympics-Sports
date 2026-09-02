// Compatibility surface for older imports. Canonical product contracts live in domain/contracts.
// Player performance is intentionally MetricDefinition-driven and never assumes one sport.
export type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  BilingualText,
  CoachEvaluation,
  CoachFeedback,
  EntityStatus,
  MetricChange,
  MetricDefinition,
  PerformanceRecord,
  Player,
  ProductPortal,
  Session,
  Sport,
  SportMediaAsset,
  SportMediaUsage,
  TrainingGroup,
} from '../domain/contracts';
