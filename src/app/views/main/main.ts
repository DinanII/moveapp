import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { GeolocationService } from '../../services/GeolocationService';
import { DatabaseManager } from '../../services/DatabaseManager';
import { ActivityTracking } from '../../services/activity-tracking.plugin';
import { PluginListenerHandle } from '@capacitor/core';
import { ActivityService } from '../../services/activity-service';
import { RouterLink } from '@angular/router';
@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-main',
  styleUrl: './main.css',
  templateUrl: './main.html',
})
export class main {
  protected readonly title = signal('move');
  private router = inject(Router);
  private geoLocService = inject(GeolocationService)
  private activityService = inject(ActivityService)

  async ngOnInit() {
    try {
      await DatabaseManager.init();

      // The database is ready here.
      if (!DatabaseManager.isReady) {
        throw new Error("Database is not ready.");
      }

      if (!await this.geoLocService.getPermissionState()) {
        await this.router.navigate(["permissions"]);
        return;
      }
      await this.router.navigate(["activities"]);

    } catch (error) {
      console.error("Failed to initialize the database (required for the app to function). Error:", error);
      // Show an error message or retry option to the user.
    }
  }

}
