import { Component, inject } from '@angular/core';
import { DatabaseManager } from '../../services/DatabaseManager';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings {
  private router = inject(Router)
  protected resetDatabase() {
    if (confirm('Are you sure you want to reset the database?')) {
      var activityBtnEl = <HTMLButtonElement>document.getElementById("activityBtn");
      activityBtnEl.disabled = true;
      DatabaseManager.resetDatabase();

    }
  }

  protected routeToActivities() {
    this.router.navigate([`activities`])
  }
}
