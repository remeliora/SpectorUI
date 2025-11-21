import {ParameterByDeviceType} from '../parameter/parameter-by-device-type';

export interface DeviceWithActiveParameters {
  id: number;
  name: string;
  ipAddress: string;
  parameters: ParameterByDeviceType[];
}
