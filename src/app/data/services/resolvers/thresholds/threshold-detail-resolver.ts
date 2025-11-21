import {ResolveFn} from '@angular/router';
import {DeviceDetail} from '../../interfaces/device/device-detail';
import {ThresholdDetail} from '../../interfaces/threshold/threshold-detail';
import {ParameterShort} from '../../interfaces/parameter/parameter-short';
import {inject} from '@angular/core';
import {DeviceService} from '../../device-service';
import {ThresholdService} from '../../threshold-service';
import {catchError, forkJoin, of} from 'rxjs';

export interface ThresholdDetailPageData {
  device: DeviceDetail | null;
  threshold: ThresholdDetail | null;
  availableParameters: ParameterShort[];
}

export const thresholdDetailResolver: ResolveFn<ThresholdDetailPageData> = (route, state) => {
  const deviceService = inject(DeviceService);
  const thresholdService = inject(ThresholdService);

  const deviceId = Number(route.paramMap.get('deviceId'));
  const thresholdId = route.paramMap.get('thresholdId');

  if (isNaN(deviceId)) {
    console.error('Invalid deviceId:', route.paramMap.get('deviceId'));
    return of({device: null, threshold: null, availableParameters: []});
  }

  // Определяем, создаем ли мы новый порог или редактируем существующий
  const threshold$ = thresholdId === 'new' || thresholdId === null
    ? of(null) // Для создания нового порога
    : thresholdService.getThresholdById(deviceId, Number(thresholdId)).pipe(
      catchError(error => {
        console.error('Failed to load threshold in resolver', error);
        return of(null);
      })
    );

  // Загружаем устройство, порог (если редактируем) и доступные параметры параллельно
  return forkJoin({
    device: deviceService.getDeviceDetail(deviceId).pipe(
      catchError(error => {
        console.error('Failed to load device in resolver', error);
        return of(null);
      })
    ),
    threshold: threshold$,
    availableParameters: thresholdService.getAvailableParameters(deviceId).pipe(
      catchError(error => {
        console.error('Failed to load available parameters in resolver', error);
        return of([]);
      })
    )
  }).pipe(
    catchError(error => {
      console.error('Failed to load threshold detail page data in resolver', error);
      return of({device: null, threshold: null, availableParameters: []});
    })
  );
};
