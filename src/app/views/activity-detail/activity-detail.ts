import { Component, inject, Input, numberAttribute, signal, WritableSignal } from '@angular/core';
import { TextBox } from '../../components/userinput/text-box/text-box';
import { ActivityService } from '../../services/activity-service';
import { GeolocationService } from '../../services/GeolocationService';
import { PluginListenerHandle } from '@capacitor/core';
import { ActivityTracking } from '../../services/activity-tracking.plugin';
import { RecordedLocation } from '../../interfaces/recorded-location';
import { AfterViewInit } from '@angular/core';
import L, { LatLngExpression } from 'leaflet';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatabaseManager } from '../../services/DatabaseManager';
@Component({
  imports: [TextBox, DatePipe, RouterLink],
  selector: 'app-activity-detail',
  styleUrl: './activity-detail.css',
  templateUrl: './activity-detail.html',
})
export class ActivityDetail {

  @Input({ transform: numberAttribute, required: false }) activityId: number = -1;

  private activityService: ActivityService = inject(ActivityService)

  private geoLocService = inject(GeolocationService)
  protected isTracking: WritableSignal<boolean> = signal(false)
  private locationListener?: PluginListenerHandle | null;
  private activeActivityId: string | null = ""
  private activatedRoute = inject(ActivatedRoute)
  private map: L.Map | null = null;
  private mapPolygon: L.Polygon<any> = L.polygon([]);
  protected hasStarted: WritableSignal<boolean> = signal(false)
  protected activityName: string = new Date().toISOString().slice(0, 10)
  protected activityCategoryId: number = 1 // 1 = uncategorized
  protected startedAt: number = -1
  protected isFirstLocationFired: WritableSignal<boolean> = signal(false)
  private locationMarker: L.Marker<any> | null = null;
  protected elapsedSeconds: number = 0;
  private timerId?: ReturnType<typeof setInterval>;
  protected endedAt: number | null = null
  protected isStored = signal(false)

  private markerIcon: L.Icon<L.IconOptions> = L.icon({
    iconUrl: "/marker-icon.png",
    // shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41], // the actual bottom of the image, so the bottom aligns with the GPS coordinate
    popupAnchor: [1, -34],
    // shadowSize: [41, 41],
  });

  async ngOnInit() {
    this.loadActivityDetails()
  }

  private async loadActivityDetails() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.activityId = Number(params.get('id')) ?? -1
    })
    // https://thecodepoints.blogspot.com/2022/06/how-to-pass-parameters-to-route-in-angular.html
    console.log(`Passed activity ID: ${this.activityId}`)
    if (!isNaN(this.activityId) && this.activityId != null && this.activityId > 0) {
      // Retrieve activity (if it doesn't exist: show 404 instead of directly creating a new one).
      const storedActivity = this.activityService.activities().find((activityToFind) => { return activityToFind.activityId === this.activityId })
      console.log(`ACTIVITY FOUND ${this.activityId}: ${JSON.stringify(storedActivity)}`)
      if (!storedActivity) {
        // TODO: show 404
        return
      }
      this.hasStarted.set(true)
      this.activityName = storedActivity.activityName
      this.startedAt = storedActivity.startedAt
      this.endedAt = this.endedAt
      this.isStored.set(true)
      this.setupMap()

      let offset = 0
      let firstLat = 0
      let firstLon = 0
      let firstFilled = false
      while (offset < DatabaseManager.pageSize) {
        let retrievedLocations = await this.retrieveLocations(offset);
        if (!firstFilled && retrievedLocations.length > 0) {
          firstLat = retrievedLocations[0].latitude
          firstLon = retrievedLocations[0].longitude
          firstFilled = true
        }
        for (let index = 0; index < retrievedLocations.length; index++) {
          const locationPoint: RecordedLocation = retrievedLocations[index];
          this.mapPolygon.addLatLng([locationPoint.latitude, locationPoint.longitude])
        }
        if (retrievedLocations.length < DatabaseManager.pageSize) {
          break;
        }
        offset += DatabaseManager.pageSize
      }
      if (this.map) {
        this.map.setView([firstLat, firstLon])
      }
    }
  }
  private async retrieveLocations(offset: number): Promise<RecordedLocation[]> {
    return await this.activityService.retrieveActivityLocations(offset, this.activityId)
  }

  protected onNameChange(newText: string) {
    this.activityName = newText;
  }

  async createActivity() {
    const newActivityId = await this.activityService.createActivity("test", 1)
    console.log(`Activity create result: ${newActivityId}`)
    if (newActivityId > 0) {
      this.activityId = newActivityId
      this.hasStarted.set(true)
      this.startedAt = Math.floor(Date.now() / 1000)
      this.updateElapsedTime();
      this.timerId = setInterval(() => {
        this.updateElapsedTime();
      }, 1000);
      this.setupMap()
      this.startTracking();
      return
    }
    console.log(`Something went wrong creating a new activity ${newActivityId}`)
    // Show feedback
  }

  private setupMap() {
    this.map = L.map('map').setView([0, 0], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
    this.mapPolygon.addTo(this.map);
  }

  protected async startTracking() {
    console.log("Tracking starting...")
    const activityId = JSON.stringify(new Date());
    const permission =
      await ActivityTracking.requestTrackingPermissions();

    if (!permission.granted) {
      throw new Error('Location permission was not granted.');
    }
    await ActivityTracking.startTracking({ activityId: activityId });

    this.locationListener = await ActivityTracking.addListener(
      'locationRecorded', (location: RecordedLocation) => {
        this.processLocationUpdate(location)
      }
    );
    this.activeActivityId = activityId;
    this.isTracking.set(true)
    console.log('isTracking (started):', this.isTracking());
  }

  private processLocationUpdate(location: RecordedLocation) {
    console.log(`New location: ${JSON.stringify(location)} The typeof: ${typeof location}`)
    const newPosition: LatLngExpression = [location.latitude, location.longitude]
    this.activityService.storeLocationPoint(location)

    if (!this.isFirstLocationFired()) {
      this.isFirstLocationFired.set(true)
    }

    if (this.map !== null) {

      if (this.locationMarker == null) {
        this.locationMarker = L.marker(newPosition, { icon: this.markerIcon }).addTo(this.map);
        this.map.setView(newPosition);
      }
      else {
        this.locationMarker.setLatLng(newPosition)
        this.map.panTo(newPosition);
      }

      this.mapPolygon.addLatLng(newPosition)
    }
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

    this.activeActivityId = null;
    this.isTracking.set(false)
    console.log('isTracking (stopped):', this.isTracking());
  }

  protected formatDuration(totalSeconds: number): string {
    // const totalSeconds = Math.floor(Date.now() / 1000) - this.startedAt
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  private updateElapsedTime() {
    this.elapsedSeconds = Math.floor(
      (Date.now() - this.startedAt) / 1000
    );
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
// Snippet from within stopTracking
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