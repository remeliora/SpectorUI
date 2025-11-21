import {ResolveFn} from '@angular/router';
import {DeviceDetail} from '../../interfaces/device/device-detail';
import {ThresholdCard} from '../../interfaces/threshold/threshold-card';
import {inject} from '@angular/core';
import {DeviceService} from '../../device-service';
import {ThresholdService} from '../../threshold-service';
import {catchError, map, forkJoin, of, switchMap} from 'rxjs';
import {ParameterService} from '../../parameter-service';
import {ParameterDetail} from '../../interfaces/parameter/parameter-detail';

export interface ThresholdPageData {
  device: DeviceDetail | null;
  thresholds: ThresholdCard[];
}

export const thresholdResolver: ResolveFn<ThresholdPageData> = (route, state) => {
  const deviceService = inject(DeviceService);
  const thresholdService = inject(ThresholdService);
  const parameterService = inject(ParameterService);

  const idParam = route.paramMap.get('deviceId');
  if (!idParam) {
    console.error('Missing deviceId in route params');
    return of({ device: null, thresholds: [] });
  }

  const deviceId = Number(idParam);
  if (isNaN(deviceId)) {
    console.error('Invalid deviceId:', idParam);
    return of({ device: null, thresholds: [] });
  }

  // Сначала загружаем основное устройство, чтобы получить deviceTypeId
  return deviceService.getDeviceDetail(deviceId).pipe(
    switchMap(device => {
      if (!device) {
        console.error('Device not found');
        return of({ device: null, thresholds: [] });
      }

      const deviceTypeId = device.deviceTypeId;
      if (!deviceTypeId) { // Проверка на null, undefined, 0
        console.error('Device Type ID not found on device object');
        return of({ device: null, thresholds: [] });
      }

      // Теперь загружаем пороги
      return forkJoin({
        device: of(device), // Передаем устройство дальше
        thresholds: thresholdService.getThresholds(deviceId).pipe(
          catchError(error => {
            console.error('Failed to load thresholds in resolver', error);
            return of([]);
          })
        ),
        deviceTypeId: of(deviceTypeId) // Передаем deviceTypeId дальше
      });
    }),
    switchMap(result => { // Изменили деструктуризацию, чтобы явно обработать случай ошибки
      // Проверяем, был ли возврат early из-за отсутствия deviceTypeId
      if (result.device === null) {
        return of({ device: null, thresholds: [] });
      }
      const { device, thresholds, deviceTypeId } = result;

      if (!thresholds || thresholds.length === 0) {
        return of({ device, thresholds: [] });
      }

      // Создаем массив Observable для получения деталей параметров
      const parameterRequests$ = thresholds.map(threshold =>
        parameterService.getParameterById(deviceTypeId, threshold.parameterId).pipe(
          map((param: ParameterDetail) => ({ ...threshold, parameterName: param.description })),
          catchError(error => {
            console.error(`Failed to load parameter ${threshold.parameterId} in resolver`, error);
            // В случае ошибки, можно оставить ID или подставить заглушку
            return of({ ...threshold, parameterName: `Параметр ${threshold.parameterId}` });
          })
        )
      );

      // Выполняем все запросы на получение параметров параллельно
      return forkJoin(parameterRequests$).pipe(
        map((enrichedThresholds: ThresholdCard[]) => ({ // Явно указали тип для enrichedThresholds
          device,
          thresholds: enrichedThresholds // Приведение типа больше не нужно
        }))
      );
    }),
    catchError(error => {
      console.error('Failed to load threshold page data in resolver', error);
      return of({ device: null, thresholds: [] });
    })
  );
};
