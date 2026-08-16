import { Component, signal } from '@angular/core';
import { BibleReader } from './components/bible-reader/bible-reader';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [BibleReader],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angularbiblereader.client');
}
