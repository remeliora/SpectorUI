import {ResolveFn} from '@angular/router';
import {DeviceTypeCard} from '../../interfaces/device-type/device-type-card';
import {inject} from '@angular/core';
import {DeviceTypeService} from '../../device-type-service';
import {catchError, of} from 'rxjs';

export const deviceTypeResolver: ResolveFn<DeviceTypeCard[]> = (route, state) => {
  const deviceTypeService = inject(DeviceTypeService);
  const filterValue = route.queryParamMap.get('filter') || '';

  return deviceTypeService.getDeviceTypes(filterValue).pipe(
    catchError(error => {
      console.error('Failed to load device types in resolver', error);
      return of([]); // Возвращаем пустой массив, если ошибка
    })
  );
};
