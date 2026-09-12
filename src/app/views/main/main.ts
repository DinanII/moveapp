import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-main',
  styleUrl: './main.css',
  templateUrl: './main.html',
})
export class main {
  protected readonly title = signal('move');
  private router = inject(Router);

  ngOnInit(){
    this.router.navigate(['permissions'])
  }
}
