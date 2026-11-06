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
import { Geolocation, Position } from '@capacitor/geolocation';
import { DateUtilsService } from '../../services/date-utils-service';
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
  protected locationListener: PluginListenerHandle | null = null
  // private activeActivityId: string | null = ""
  private activatedRoute = inject(ActivatedRoute)
  private map: L.Map | null = null;
  private mapPolyLine: L.Polyline<any> = L.polygon([]);
  protected hasStarted: WritableSignal<boolean> = signal(false)
  protected activityName: string = new Date().toISOString().slice(0, 10)
  protected activityCategoryId: number = 1 // 1 = uncategorized
  protected startedAt: number = -1
  protected isFirstLocationFired: WritableSignal<boolean> = signal(false)
  private locationMarker: L.Marker<any> | null = null;
  private timerId?: ReturnType<typeof setInterval>;
  protected endedAt: number | null = null
  protected isStored = signal(false)
  private readonly LAST_ACTIVITY_LOCALSTORAGE_KEY: string = 'lastActivityId'
  protected formattedDuration = signal('0s')
  protected dateUtilsService = inject(DateUtilsService)
  private router = inject(Router)
  // protected trackingStoppable = signal(false)
  // Leaflet's element requires an explicit height and width to be set in order to work properly
  // protected mapElStyleRules: string = `width: ${window.innerWidth * 0.6} px; height: ${window.innerHeight * 0.75}; margin: 0 auto;`

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
      this.activityName = storedActivity.activityName
      this.startedAt = storedActivity.startedAt
      this.endedAt = storedActivity.endedAt

      this.hasStarted.set(true)
      this.setupMap()

      let offset = 0
      let firstLat = 0
      let firstLon = 0
      let firstFilled = false
      while (true) {
        let retrievedLocations = await this.retrieveLocations(offset);
        if (!firstFilled && retrievedLocations.length > 0) {
          firstLat = retrievedLocations[0].latitude
          firstLon = retrievedLocations[0].longitude
          firstFilled = true
        }
        for (let index = 0; index < retrievedLocations.length; index++) {
          const locationPoint: RecordedLocation = retrievedLocations[index];
          this.mapPolyLine.addLatLng([locationPoint.latitude, locationPoint.longitude])
        }
        if (retrievedLocations.length < DatabaseManager.pageSize) {
          break;
        }
        offset += DatabaseManager.pageSize
      }
      if (this.map) {
        this.map.setView([firstLat, firstLon])
      }

      if (!firstFilled) {
        if (this.map) {
          this.map.remove()
        }

        const mapEl = document.getElementById('map')
        if (mapEl) {
          mapEl.remove()
        }
      }


      const lastActivityId = JSON.parse(localStorage.getItem(this.LAST_ACTIVITY_LOCALSTORAGE_KEY) ?? JSON.stringify(-1))

      // Determine if the last activity you where doing is equal to the activity being loaded into this detail screen.
      // Is not the case if an activity is busy and the user visits an older activity.
      if (this.endedAt === null && lastActivityId !== '' && !isNaN(Number(lastActivityId)) && this.activityId === Number(lastActivityId)) {
        console.log('Reconnecting to existing tracking session');
        this.timerId = this.setActivityTimer()
        if (this.geoLocService.hasPermission()) {
          await this.registerLocationListener();
        }
        this.isTracking.set(true);
      }
      else {
        this.isStored.set(true)
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
    localStorage.removeItem(this.LAST_ACTIVITY_LOCALSTORAGE_KEY)
    const newActivityId = await this.activityService.createActivity(this.activityName, 1)
    console.log(`Activity create result: ${newActivityId}`)
    if (newActivityId > 0) {
      this.activityId = newActivityId
      this.hasStarted.set(true)
      this.startedAt = this.dateUtilsService.getUnixTime()
      this.timerId = this.setActivityTimer()
      localStorage.setItem(this.LAST_ACTIVITY_LOCALSTORAGE_KEY, JSON.stringify(this.activityId))
      this.isTracking.set(true);
      if (this.geoLocService.hasPermission()) {
        this.setupMap()
        this.startTracking();
      }
      return
    }
    console.log(`Something went wrong creating a new activity ${newActivityId}`)
  }

  private setActivityTimer() {
    return setInterval(() => {
      this.formattedDuration.set(this.dateUtilsService.formatDuration(this.dateUtilsService.getUnixTime() - this.startedAt))
    }, 1000);
  }

  private setupMap() {
    if (this.map !== null) {
      this.map.remove();
      this.map = null;
    }

    this.locationMarker = null;
    this.mapPolyLine = L.polyline([]);

    this.map = L.map('map').setView([0, 0], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.mapPolyLine.addTo(this.map);
  }

  protected async startTracking() {
    console.log('Location tracking starting...');
    const activityId = String(this.activityId);
    const permission = await ActivityTracking.requestTrackingPermissions();
    if (!permission.granted) {
      throw new Error('Location permission was not granted.');
    }
    await this.registerLocationListener();
    await ActivityTracking.startTracking({ activityId });

  }


  private async registerLocationListener() {
    if (this.locationListener !== null) {
      return;
    }

    this.locationListener = await ActivityTracking.addListener(
      'locationRecorded',
      (location: RecordedLocation) => {
        this.processLocationUpdate(location);
      }
    );

    console.log('Location listener registered:', this.locationListener !== null);
  }

  private processLocationUpdate(location: RecordedLocation) {
    console.log(`New location: ${JSON.stringify(location)} The typeof: ${typeof location}`)
    console.log(JSON.stringify(this.locationListener))
    const newPosition: LatLngExpression = [location.latitude, location.longitude]
    this.activityService.storeLocationPoint(location, this.activityId)

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

      this.mapPolyLine.addLatLng(newPosition)
    }
    else {
      console.log('map is null!!!!')
    }
  }

  protected async stopTracking() {
    const activityId = this.activityId;
    if (!activityId || isNaN(Number(activityId))) {
      console.error(`No activity ID, aborting... ${JSON.stringify(activityId)}`)
      return
    };
    console.log("Tracking stopping...")

    if (this.timerId) {
      clearInterval(this.timerId)
    }

    if (this.locationListener) {
      // The native service flushes and closes the file before resolving.
      await ActivityTracking.stopTracking();

      await this.locationListener.remove();
      this.locationListener = null;
    }
    localStorage.removeItem(this.LAST_ACTIVITY_LOCALSTORAGE_KEY)
    this.activityService.endActivity(Number(activityId))

    this.isTracking.set(false)
    console.log('isTracking (stopped):', this.isTracking());
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  protected async deleteActivity() {
    if (!this.activityId || this.activityId < 1) return

    if (confirm("Are you sure you want to delete this activity?")) {
      const isDeleted = await this.activityService.deleteActivity(this.activityId)
      console.log(`current ac id: ${this.activityId}`)
      if (isDeleted) {
        this.router.navigate(['/activities'])
        return
      }
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
//
// Alternative location tracking, a capacitor plugin
// =======================================
// npm install @capacitor/geolocation
// https://capacitorjs.com/docs/apis/geolocation#positionoptions
// let locationIndex = 0;
// Geolocation.watchPosition(
//   {
//     enableHighAccuracy: true,
//     enableLocationFallback: true,
//   },
//   (position: Position) => {
//     const recordedLocation: RecordedLocation = {
//       accuracy: position.coords.accuracy,
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude,
//       locationIndex: locationIndex,
//       timestamp: position.timestamp
//     }
//     locationIndex++
//     this.processLocationUpdate(recordedLocation)
//   }
// )
// =======================================
//
// Useful for debugging (around line 110/111, where gets determined if the activity being loaded in is equal to the current ongoing activity)
// console.log(`Reiniting tracking`)
// console.log(this.activityId)
// console.log(this.endedAt)
// console.log(lastActivityId)
// console.log(!this.endedAt && lastActivityId && !isNaN(Number(lastActivityId)) && this.activityId == Number(lastActivityId))
// console.log(this.locationListener == null)
// console.log(`Con 1: ${this.endedAt === null && lastActivityId !== ''}`)
// console.log(`Con 2: ${!isNaN(Number(lastActivityId))}`)
// console.log(`Con 3: ${this.activityId === Number(lastActivityId)}`)