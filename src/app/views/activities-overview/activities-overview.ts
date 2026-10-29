import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService } from '../../services/activity-service';
import { DatePipe } from '@angular/common';
import { DatabaseManager } from '../../services/DatabaseManager';
@Component({
  imports: [DatePipe],
  selector: 'app-activities-overview',
  styleUrl: './activities-overview.css',
  templateUrl: './activities-overview.html',
})
export class ActivitiesOverview {

  private router = inject(Router)
  protected activityService = inject(ActivityService)
  protected backEnabled = signal(false)
  protected nextEnabled = signal(true)
  private initialOffset = this.activityService.getCurrentOffset()

  protected routeToActivity(activityId: number) {
    this.router.navigate([`activities/detail/${activityId}`])
  }

  protected routeToSettings() {
    this.router.navigate([`settings`])
  }

  async ngOnInit() {
    await this.activityService.retrieveActivities()
    // There is at least one page before and after
    if (this.initialOffset > 0 && this.activityService.activities().length == DatabaseManager.pageSize) {
      this.backEnabled.set(true)
      this.nextEnabled.set(true)
      return;
    }
    // You are on the last page
    else if (this.initialOffset > 0 && this.activityService.activities().length < DatabaseManager.pageSize) {
      this.backEnabled.set(true)
      this.nextEnabled.set(false)
      return;
    }
    // The first page, but it already contains all activities 
    else if (this.initialOffset == 0 && this.activityService.activities().length < DatabaseManager.pageSize) {
      this.backEnabled.set(false)
      this.nextEnabled.set(false)
      return;
    }
  }

  protected async pageBack() {
    const res = await this.activityService.pageBack()
    this.backEnabled.set(res)
    if (!this.nextEnabled()) {
      this.nextEnabled.set(true)
    }

  }

  protected async pageNext() {
    const res = await this.activityService.pageNext()
    this.nextEnabled.set(res)
    if (!this.backEnabled()) {
      this.backEnabled.set(true)
    }
  }
}
