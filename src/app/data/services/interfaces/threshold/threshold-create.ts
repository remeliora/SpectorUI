export interface ThresholdCreate {
  lowValue: number | null;
  matchExact: string | null;
  highValue: number | null;
  isEnable: boolean;
  parameterId: number;
}
