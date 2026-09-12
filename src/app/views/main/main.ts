import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-main',
  styleUrl: './main.css',
  templateUrl: './main.html',
})
export class main {
  protected readonly title = signal('move');
}
