import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {SvgIcon} from '../svg-icon/svg-icon';
import {Navbar} from '../navbar/navbar';
import {MenuListItem} from '../menu/menu-list-item/menu-list-item';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    SvgIcon,
    Navbar,
    MenuListItem
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private readonly router = inject(Router);

  currentRoute: string = '';

  constructor() {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  isChartPage(): boolean {
    return this.currentRoute.includes('/graphs');
  }
}
