import {ResolveFn} from '@angular/router';
import {StatusDictionaryCard} from '../../interfaces/status-dictionary/status-dictionary-card';
import {inject} from '@angular/core';
import {StatusDictionaryService} from '../../status-dictionary-service';
import {catchError, of} from 'rxjs';

export const statusDictionaryResolver: ResolveFn<StatusDictionaryCard[]> = () => {
  const statusDictionaryService = inject(StatusDictionaryService);
  return statusDictionaryService.getStatusDictionaries()
    .pipe(
      catchError((error) => {
        console.error('Failed to load status dictionaries in resolver', error);
        return of([])
      })
    )
};
