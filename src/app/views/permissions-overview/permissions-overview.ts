import { Component, inject } from '@angular/core';
import { Switch } from '../../components/userinput/switch/switch';
import { GeolocationService } from '../../services/GeolocationService';
@Component({
  imports: [Switch],
  selector: 'app-permissions-overview',
  styleUrl: './permissions-overview.css',
  templateUrl: './permissions-overview.html',
})
export class PermissionsOverview {

  private geoLocService = inject(GeolocationService)

  protected isLocPermitted = this.geoLocService.getPermissionState();

  protected async askLocPerm(toggleResult: boolean) {
    // Ask permission for location service if not already given
    const hasPerm = await this.geoLocService.askPermission();

    hasPerm == true ? console.log("disable input (perm is true") : console.log("enable input (perm is false") 
  }
}
