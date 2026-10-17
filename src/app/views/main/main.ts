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
  protected isTracking = signal(false)
  private locationListener?: PluginListenerHandle | null;
  private activeActivityId: string | null = ""


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

  protected async startTracking() {
    console.log("Tracking starting...")
    const activityId = JSON.stringify(new Date());

    // Persist the activity's ID and "recording" state first.
    // await this.activityRepository.createActivity({
    //   id: activityId,
    //   status: 'recording'
    // });
    const permission =
      await ActivityTracking.requestTrackingPermissions();

    if (!permission.granted) {
      throw new Error('Location permission was not granted.');
    }

    this.locationListener = await ActivityTracking.addListener(
      'locationRecorded', (location) => {
        console.log('New location:', location);
        // Next step: append this point to your route signal.
        // Your map component can use that route to redraw the line.
      }
    );

    await ActivityTracking.startTracking({ activityId: activityId });

    this.activeActivityId = activityId;
    this.isTracking.set(true)
    console.log('isTracking (started):', this.isTracking());
  }

  protected async stopTracking() {
    const activityId = this.activeActivityId;
    if (!activityId) {
      console.error(`No activity ID, aborting...`)
      return
    };
    console.log("Tracking stopping...")

    // The native service flushes and closes the file before resolving.
    await ActivityTracking.stopTracking();
    await this.locationListener?.remove();
    this.locationListener = undefined;

    // const { locations } =
    //   await ActivityTracking.getRecordedLocations({ activityId });

    // console.log(JSON.stringify(locations))
    // Implement this as a transaction in your existing SQLite layer.
    // await this.activityRepository.saveLocations(
    //   activityId,
    //   locations
    // );

    // Delete only after the permanent DB transaction succeeds.
    // await ActivityTracking.deleteRecordedLocations({ activityId });

    this.activeActivityId = null;
    this.isTracking.set(false)
    console.log('isTracking (stopped):', this.isTracking());
  }
}
