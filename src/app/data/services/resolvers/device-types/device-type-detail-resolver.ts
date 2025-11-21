import {ResolveFn} from '@angular/router';
import {DeviceTypeDetail} from '../../interfaces/device-type/device-type-detail';
import {inject} from '@angular/core';
import {DeviceTypeService} from '../../device-type-service';
import {catchError, of} from 'rxjs';

export const deviceTypeDetailResolver: ResolveFn<DeviceTypeDetail | null> = (route, state) => {
  const service = inject(DeviceTypeService);
  const id = route.paramMap.get('deviceTypeId');

  if (id === 'new' || id === null) {
    return of(null);
  }

  const numericId = Number(id);
  if (isNaN(numericId)) {
    return of(null);
  }

  return service.getDeviceTypeById(numericId).pipe(
    catchError(error => {
      console.error('Failed to load device type in resolver', error);
      return of(null);
    })
  );
};
