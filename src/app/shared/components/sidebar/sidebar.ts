import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {SvgIcon} from '../svg-icon/svg-icon';
import {Navbar} from '../navbar/navbar';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    SvgIcon,
    Navbar
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

}
