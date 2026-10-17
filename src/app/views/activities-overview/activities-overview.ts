import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-activities-overview',
  styleUrl: './activities-overview.css',
  templateUrl: './activities-overview.html',
})
export class ActivitiesOverview {

  private router = inject(Router)

  protected routeToActivity() {
    this.router.navigate(['activities/detail'])
  }
}
