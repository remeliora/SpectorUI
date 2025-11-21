export interface DeviceCreate {
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
