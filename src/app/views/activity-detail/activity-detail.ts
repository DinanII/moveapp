import { Component, inject, Input, numberAttribute, signal } from '@angular/core';
import { TextBox } from '../../components/userinput/text-box/text-box';
import { ActivityService } from '../../services/activity-service';
import { GeolocationService } from '../../services/GeolocationService';
import { PluginListenerHandle } from '@capacitor/core';
import { ActivityTracking } from '../../services/activity-tracking.plugin';

@Component({
  imports: [TextBox],
  selector: 'app-activity-detail',
  styleUrl: './activity-detail.css',
  templateUrl: './activity-detail.html',
})
export class ActivityDetail {

  @Input({ transform: numberAttribute, required: false }) activityId: number = -1;

  private activityService: ActivityService = inject(ActivityService)

  private geoLocService = inject(GeolocationService)
  protected isTracking = signal(false)
  private locationListener?: PluginListenerHandle | null;
  private activeActivityId: string | null = ""

  async ngOnInit() {
    console.log(`Passed activity ID: ${this.activityId}`)

    if (this.activityId != null && this.activityId > 0) {
      await this.createActivity()
      return
    }
    // Retrieve activity (if it doesn't exist: show 404 instead of directly creating a new one).
  }

  onNameChange(newText: string) {
    console.log(`Text changed! ${newText}`)
  }

  async createActivity() {
    const result = await this.activityService.createActivity("test")
    console.log(`Activity create result: ${result}`)
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
        this.processLocationUpdate()
      }
    );

    await ActivityTracking.startTracking({ activityId: activityId });

    this.activeActivityId = activityId;
    this.isTracking.set(true)
    console.log('isTracking (started):', this.isTracking());
  }

  private processLocationUpdate() {
    console.log('New location:', location);
    // Next step: append this point to your route signal.
    // Your map component can use that route to redraw the line.
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
