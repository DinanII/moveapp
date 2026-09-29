import { Service } from '@angular/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
@Service()
export class GeolocationService {
    private hasPermission: boolean | null = null
    // private storageKey: string = "locationPerms"

    public async askPermission(): Promise<boolean> {
        if (this.hasPermission && typeof this.hasPermission == 'boolean') return this.hasPermission
        let hasPerm = false;
        try {
            const permStatus = await Geolocation.requestPermissions()
            console.debug(`Permission result: ${JSON.stringify(permStatus)}`)
            hasPerm = this.handlePermissionStatus(permStatus)

        } catch (error) {
            // TODO: Implement user friendly messages for the available errorcodes
            // Perhaps make an enum linking each errorcode to a string 
            console.error(`An error has occured whilst requesting geolocation permission. Error type: ${typeof error} Message: ${JSON.stringify(error)}`)
            hasPerm = false
        }
        this.hasPermission = hasPerm
        console.log("GeoLocService askPermission result: " + this.hasPermission)
        return this.hasPermission;

    }

    public async getPermissionState(): Promise<boolean> {
        if (this.hasPermission == null) {
            await this.restorePermState()
        }
        return this.hasPermission ?? false
    }

    private async restorePermState() {
        let hasPerm: boolean
        try {
            const permStatus = await Geolocation.checkPermissions()
            hasPerm = this.handlePermissionStatus(permStatus)
        } catch (error) {
            // Location services are (very likely) disabled. 
            // Geolocation.checkPermissions() throws if system location is disabled
            console.error("Failed to check location param in getPermState (service probably disabled):" + JSON.stringify(error))
            hasPerm = false
        }
        this.hasPermission = hasPerm
    }

    private handlePermissionStatus(status: PermissionStatus): boolean {
        // DISCUSS: coarseLocation (for non-precise locations, can be a few KM's off)
        // TODO: Handle other possibilities prompt et cetera.
        switch (status.location) {
            case 'granted':
                return true
            case "denied":
                return false
            case "prompt":
                console.debug("Location permission state is prompt, returning false..")
                return false
            case 'prompt-with-rationale':
                console.debug("Location permission state is prompt with rationale, returning false..")
                return false
            default:
                console.warn('Permisson location request returned an unknown location state. Setting perm to false');
                return false
        }
    }
}
