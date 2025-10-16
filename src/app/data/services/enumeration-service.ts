import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EnumerationCard} from './interfaces/enumeration/enumeration-card';
import {EnumerationDetail} from './interfaces/enumeration/enumeration-detail';
import {EnumerationCreate} from './interfaces/enumeration/enumeration-create';

@Injectable({
  providedIn: 'root'
})
export class EnumerationService {
  http = inject(HttpClient)

  baseApiUrl = 'http://localhost:8080/api/v1/main/enumerations'

  getEnumeratedStatus() {
    return this.http.get<EnumerationCard[]>(this.baseApiUrl)
  }

  getEnumeratedStatusDetail(collectionName: string) {
    return this.http.get<EnumerationDetail>(`${this.baseApiUrl}/${collectionName}`);
  }

  createEnumeratedStatus(data: EnumerationCreate) {
    return this.http.post<EnumerationDetail>(this.baseApiUrl, data);
  }

  updateEnumeratedStatus(collectionName: string, data: EnumerationDetail) {
    return this.http.put<EnumerationDetail>(`${this.baseApiUrl}/${collectionName}`, data);
  }

  deleteEnumeratedStatus(collectionName: string) {
    return this.http.delete<void>(`${this.baseApiUrl}/${collectionName}`);
  }
}
