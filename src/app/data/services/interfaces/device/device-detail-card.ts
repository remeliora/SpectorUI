import {ParameterData} from '../parameter/parameter-data';

export interface DeviceDetailCard {
  deviceId: number;
  deviceName: string;
  deviceIp: string;
  isEnable: boolean;
  location: string;
  status: string;
  parameters: ParameterData[];
}
