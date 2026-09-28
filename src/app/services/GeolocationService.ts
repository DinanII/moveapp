import { Service } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
@Service()
export class GeolocationService {
    private hasPermission: boolean = false

    public async askPermission(): Promise<boolean> {
        try {
            const hasPermission = await Geolocation.requestPermissions()
            console.debug(`Permission result: ${JSON.stringify(hasPermission)}`)
            switch (hasPermission.location) {
                case 'granted':
                    this.hasPermission = true
                    break
                case "denied":
                    this.hasPermission = false;
                    break
                case "prompt":
                    console.debug("Location permission state is prompt")
                    break
                case 'prompt-with-rationale':
                    console.debug("Location permission state is prompt with rationale")
                    break
                default:
                    console.warn('Permisson location request returned an unknown location state. Setting perm to false');
                    this.hasPermission = false
                    break;
            }

        } catch (error) {
            console.error(`An error has occured whilst requesting geolocation permission. Error type: ${typeof error} Message: ${error}`)
            this.hasPermission = false
        }
        return this.hasPermission;
        
    }

    public getPermissionState(): boolean {
        return this.hasPermission;
    }
}
