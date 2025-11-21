import {DeviceParameterRequest} from './device-parameter-request';

export interface ChartDataRequest {
  devices: DeviceParameterRequest[];
  from: string;
  to: string;
}
