export interface ThresholdDetail {
  id: number;
  lowValue: number | null;
  matchExact: string | null;
  highValue: number | null;
  isEnable: boolean;
  parameterId: number;
}
