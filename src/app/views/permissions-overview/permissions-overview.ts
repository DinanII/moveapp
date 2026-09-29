import { Component, inject, OnInit, signal } from '@angular/core';
import { Switch } from '../../components/userinput/switch/switch';
import { GeolocationService } from '../../services/GeolocationService';
@Component({
  imports: [Switch],
  selector: 'app-permissions-overview',
  styleUrl: './permissions-overview.css',
  templateUrl: './permissions-overview.html',
})
export class PermissionsOverview implements OnInit {

  private geoLocService = inject(GeolocationService);


  protected isLocPermitted = signal(false);

  async ngOnInit(): Promise<void> {
    this.isLocPermitted.set(await this.geoLocService.getPermissionState());

    console.log(
      'Overview perm permitted:',
      this.isLocPermitted
    );


  }

  protected async askLocPerm() {
    try {
      const result = await this.geoLocService.askPermission();
      this.handleLocation(result);
    } catch (error) {
      console.log(
        'Perm overview: Error whilst asking permission, so location not permitted'
      );

      this.handleLocation(false);
    }
  }

  private handleLocation(hasPerm: boolean) {
    this.isLocPermitted.set(hasPerm);
  }
}
// Alternative for signals: Change detection reference
// 1. Import { ChangeDetectorRef } from angular core
// 2. Inject: private cdr = inject(ChangeDetectorRef);
// 3. change ngOnInit to something like this.
// async ngOnInit(): Promise<void> {
//   this.isLocPermitted =
//     await this.geoLocService.getPermissionState();

//   console.log(
//     'Overview perm permitted:',
//     this.isLocPermitted
//   );

//   this.cdr.detectChanges();
// }

// 4. Also call this.cdr.detectChanges(); at the end of askLocPerm()