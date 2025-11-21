export interface DeviceDetail {
  id: number;
  name: string;
  ipAddress: string;
  deviceTypeId: number;
  description: string;
  location: string;
  period: number;
  alarmType: string;
  isEnable: boolean;
  activeParametersId: number[];
}
