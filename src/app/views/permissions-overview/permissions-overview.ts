import { Component } from '@angular/core';
import { Switch } from '../../components/userinput/switch/switch';
@Component({
  imports: [Switch],
  selector: 'app-permissions-overview',
  styleUrl: './permissions-overview.css',
  templateUrl: './permissions-overview.html',
})
export class PermissionsOverview {
  protected setLocationPerm(toggleResult: boolean) {
    // Ask permission for location service if not already given
  }
}
