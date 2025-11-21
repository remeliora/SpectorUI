import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppSettingDetail} from './interfaces/app-setting/app-setting-detail';

@Injectable({
  providedIn: 'root'
})
export class AppSettingService {
  http = inject(HttpClient);

  baseApiUrl = 'http://localhost:8080/api/v1/main/settings';

  getSettings() {
    return this.http.get<AppSettingDetail>(this.baseApiUrl);
  }

  updateSettings(data: AppSettingDetail) {
    return this.http.put<AppSettingDetail>(this.baseApiUrl, data);
  }

  resetSettings() {
    return this.http.post<AppSettingDetail>(`${this.baseApiUrl}/reset`, {});
  }
}
