import { Component } from '@angular/core';
import {SidebarHeader} from './sidebar-header/sidebar-header';
import {SidebarMenu} from './sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarHeader,
    SidebarMenu
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

}
