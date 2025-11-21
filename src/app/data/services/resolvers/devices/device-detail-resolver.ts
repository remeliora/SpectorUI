import {ResolveFn} from '@angular/router';
import {DeviceDetail} from '../../interfaces/device/device-detail';
import {inject} from '@angular/core';
import {DeviceService} from '../../device-service';
import {catchError, forkJoin, of} from 'rxjs';
import {DeviceTypeShort} from '../../interfaces/device-type/device-type-short';
import {EnumOption} from '../../interfaces/enum/enum-option';
import {EnumService} from '../../enum-service';

export interface DeviceDetailPageData {
  device: DeviceDetail | null;
  deviceTypes: DeviceTypeShort[];
  locations: string[];
  alarmTypes: EnumOption[];
}

export const deviceDetailResolver: ResolveFn<DeviceDetailPageData> = (route, state) => {
  const deviceService = inject(DeviceService);
  const enumService = inject(EnumService);
  const id = route.paramMap.get('deviceId');

  if (id === 'new' || id === null) {
    return forkJoin({
      device: of(null),
      deviceTypes: deviceService.getAvailableDeviceTypes().pipe(
        catchError(error => {
          console.error('Failed to load device types in resolver', error);
          return of([]);
        })
      ),
      locations: deviceService.getUniqueLocations().pipe(
        catchError(error => {
          console.error('Failed to load locations in resolver', error);
          return of([]);
        })
      ),
      alarmTypes: enumService.getAlarmTypes().pipe(
        catchError(error => {
          console.error('Failed to load alarm types in resolver', error);
          return of([]);
        })
      )
    });
  }

  const numericId = Number(id);
  if (isNaN(numericId)) {
    console.error('Invalid deviceId:', id);
    return of({device: null, deviceTypes: [], locations: [], alarmTypes: []});
  }

  return forkJoin({
    device: deviceService.getDeviceDetail(numericId).pipe(
      catchError(error => {
        console.error('Failed to load device in resolver', error);
        return of(null);
      })
    ),
    deviceTypes: deviceService.getAvailableDeviceTypes().pipe(
      catchError(error => {
        console.error('Failed to load device types in resolver', error);
        return of([]);
      })
    ),
    locations: deviceService.getUniqueLocations().pipe(
      catchError(error => {
        console.error('Failed to load locations in resolver', error);
        return of([]);
      })
    ),
    alarmTypes: enumService.getAlarmTypes().pipe(
      catchError(error => {
        console.error('Failed to load alarm types in resolver', error);
        return of([]);
      })
    )
  });
};
