import { Component } from '@angular/core';
import {Sidebar} from '../sidebar/sidebar';
import {ContentArea} from '../content-area/content-area';

@Component({
  selector: 'app-main-layout',
  imports: [
    Sidebar,
    ContentArea
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}
