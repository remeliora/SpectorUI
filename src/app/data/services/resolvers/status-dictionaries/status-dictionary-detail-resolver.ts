import {ResolveFn} from '@angular/router';
import {StatusDictionaryDetail} from '../../interfaces/status-dictionary/status-dictionary-detail';
import {inject} from '@angular/core';
import {StatusDictionaryService} from '../../status-dictionary-service';
import {catchError, of} from 'rxjs';

export const statusDictionaryDetailResolver: ResolveFn<StatusDictionaryDetail | null> = (route, state) => {
  const statusDictionaryService = inject(StatusDictionaryService);
  const id = route.paramMap.get('statusDictionaryId');

  if (id === 'new' || id === null) {
    return of(null);
  }

  const numericId = Number(id);
  if (isNaN(numericId)) {
    return of(null);
  }

  return statusDictionaryService.getStatusDictionaryDetail(numericId)
    .pipe(
      catchError(error => {
        console.error('Failed to load status dictionary detail in resolver', error);
        return of(null);
      })
    )
};
