import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export type NavbarConfig = {
  showMainLinks?: boolean;
  showFilter?: boolean;
  showBackButton?: boolean;
  showSubsectionButton?: boolean;
  subsectionButton?: {
    label: string;
    route: string;
  };
  backRoute?: string;
};

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private configSubject = new BehaviorSubject<NavbarConfig>({})
  config$ = this.configSubject.asObservable()

  setConfig(config: NavbarConfig) {
    this.configSubject.next(config);
  }

  resetConfig() {
    this.configSubject.next({});
  }
}
