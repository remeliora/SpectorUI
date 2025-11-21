import {ResolveFn} from '@angular/router';
import {DeviceTypeDetail} from '../../interfaces/device-type/device-type-detail';
import {ParameterCard} from '../../interfaces/parameter/parameter-card';
import {inject} from '@angular/core';
import {catchError, forkJoin, of} from 'rxjs';
import {DeviceTypeService} from '../../device-type-service';
import {ParameterService} from '../../parameter-service';

export interface ParameterPageData {
  deviceType: DeviceTypeDetail | null;
  parameters: ParameterCard[];
}

export const parameterResolver: ResolveFn<ParameterPageData> = (route, state) => {
  const deviceTypeService = inject(DeviceTypeService);
  const parameterService = inject(ParameterService);

  const idParam = route.paramMap.get('deviceTypeId');
  if (!idParam) {
    console.error('Missing deviceTypeId in route params');
    return of({deviceType: null, parameters: []});
  }

  const deviceTypeId = Number(idParam);
  if (isNaN(deviceTypeId)) {
    console.error('Invalid deviceTypeId:', idParam);
    return of({deviceType: null, parameters: []});
  }

  return forkJoin({
    deviceType: deviceTypeService.getDeviceTypeById(deviceTypeId),
    parameters: parameterService.getParameters(deviceTypeId)
  }).pipe(
    catchError(error => {
      console.error('Failed to load parameter page data in resolver', error);
      return of({deviceType: null, parameters: []});
    })
  );
};
