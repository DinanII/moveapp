import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { GeolocationService } from '../../services/GeolocationService';
import { DatabaseManager } from '../../services/DatabaseManager';
import { ActivityTracking } from '../../services/activity-tracking.plugin';
import { PluginListenerHandle } from '@capacitor/core';

@Component({
  imports: [RouterOutlet],
  selector: 'app-main',
  styleUrl: './main.css',
  templateUrl: './main.html',
})
export class main {
  protected readonly title = signal('move');
  private router = inject(Router);
  private geoLocService = inject(GeolocationService)


  async ngOnInit() {
    DatabaseManager.init();
    if (!await this.geoLocService.getPermissionState()) {
      this.router.navigate(['permissions'])
      return
    }
    this.router.navigate(['activities'])
  }

  protected resetDatabase() {
    DatabaseManager.resetDatabase();
  }
}
