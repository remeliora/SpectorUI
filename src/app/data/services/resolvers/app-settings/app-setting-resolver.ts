import {ResolveFn} from '@angular/router';
import {AppSettingDetail} from '../../interfaces/app-setting/app-setting-detail';
import {inject} from '@angular/core';
import {AppSettingService} from '../../app-setting-service';
import {catchError, of} from 'rxjs';

export const appSettingResolver: ResolveFn<AppSettingDetail> = (route, state) => {
  const service = inject(AppSettingService);

  return service.getSettings().pipe(
    catchError(error => {
      console.error('Failed to load app settings in resolver', error);
      // Можно вернуть значения по умолчанию
      return of({
        id: 1,
        pollActive: true,
        alarmActive: true
      });
    })
  );
};
