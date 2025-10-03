import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EnumOption} from './interfaces/enum/enum-option';

@Injectable({
  providedIn: 'root'
})
export class EnumService {
  http = inject(HttpClient);
  baseApiUrl = 'http://localhost:8080/api/v1/main/enums';

  getDataTypes() {
    return this.http.get<EnumOption[]>(`${this.baseApiUrl}/data-types`);
  }

  getAlarmTypes() {
    return this.http.get<EnumOption[]>(`${this.baseApiUrl}/alarm-types`);
  }
}
