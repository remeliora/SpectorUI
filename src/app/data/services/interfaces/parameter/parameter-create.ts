export interface ParameterCreate {
  name: string;
  address: string;
  metric: string;
  additive: number;
  coefficient: number;
  description: string;
  dataType: string;
  activeDevicesId: number[];
}
