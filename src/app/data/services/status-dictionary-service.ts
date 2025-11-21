import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StatusDictionaryCard} from './interfaces/status-dictionary/status-dictionary-card';
import {StatusDictionaryDetail} from './interfaces/status-dictionary/status-dictionary-detail';
import {StatusDictionaryCreate} from './interfaces/status-dictionary/status-dictionary-create';
import {StatusDictionaryUpdate} from './interfaces/status-dictionary/status-dictionary-update';

@Injectable({
  providedIn: 'root'
})
export class StatusDictionaryService {
  private http = inject(HttpClient)

  private readonly baseApiUrl = 'http://localhost:8080/api/v1/main/status_dictionaries';

  getStatusDictionaries() {
    return this.http.get<StatusDictionaryCard[]>(this.baseApiUrl);
  }

  getStatusDictionaryDetail(id: number) {
    return this.http.get<StatusDictionaryDetail>(`${this.baseApiUrl}/${id}`);
  }

  createStatusDictionary(data: StatusDictionaryCreate) {
    return this.http.post<StatusDictionaryDetail>(this.baseApiUrl, data);
  }

  updateStatusDictionary(id: number, data: StatusDictionaryUpdate) {
    return this.http.put<StatusDictionaryDetail>(`${this.baseApiUrl}/${id}`, data);
  }

  deleteStatusDictionary(id: number) {
    return this.http.delete<void>(`${this.baseApiUrl}/${id}`);
  }
}
