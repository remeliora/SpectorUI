import {ParameterData} from './parameter-data';

export interface ParameterDataStatus {
  deviceId: number;
  deviceName: string;
  status: string;
  parameters: ParameterData[];
}
