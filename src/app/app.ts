import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainLayout} from './shared/components/layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SpectorUI');
}
