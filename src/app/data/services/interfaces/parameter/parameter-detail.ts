export interface ParameterDetail {
  id: number;
  name: string;
  address: string;
  metric: string;
  additive: number;
  coefficient: number;
  description: string;
  dataType: string;
  activeDevicesId: number[];
  statusDictionaryId: number;
}
