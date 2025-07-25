import { Component } from '@angular/core';
import {ContentHeader} from './content-header/content-header';

@Component({
  selector: 'app-content-area',
  imports: [
    ContentHeader
  ],
  templateUrl: './content-area.html',
  styleUrl: './content-area.css'
})
export class ContentArea {

}
