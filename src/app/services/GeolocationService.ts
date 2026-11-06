import { Service, signal } from '@angular/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { StatusCodes } from '../enums/status-codes';
@Service()
export class GeolocationService {

    private _hasPermission = signal<boolean | null>(null)

    public readonly hasPermission = this._hasPermission.asReadonly()

    // private hasPermission: boolean | null = null
    // private storageKey: string = "locationPerms"

    // private writable state via signal
    private readonly _permMessage = signal<string>('Permission unknown.');
    // public readonly
    public readonly geoPermMessage = this._permMessage.asReadonly()

    // private writable state via signal
    private readonly _permStatus = signal<StatusCodes>(StatusCodes.UNKNOWN);
    // public readonly
    public readonly permStatus = this._permStatus.asReadonly()

    public async askPermission(): Promise<boolean> {
        if (this._hasPermission() && typeof this._hasPermission() == 'boolean') return this._hasPermission() ?? false
        let hasPerm = false;

        try {
            const permStatus = await Geolocation.requestPermissions()
            console.debug(`Permission result: ${JSON.stringify(permStatus)}`)
            this._permMessage.set('Permission granted.')
            hasPerm = this.handlePermissionStatus(permStatus)

            let msg = hasPerm ? 'Permission granted' : 'Permission denied, app might not function to it\'s full extend'
            let statusCode = hasPerm ? StatusCodes.OK : StatusCodes.WARN
            this.updatePermStatus(hasPerm, msg, statusCode)
        } catch (error) {
            // TODO: Implement user friendly messages for the available errorcodes
            // Perhaps make an enum linking each errorcode to a string
            let msg = ''
            if (typeof error === 'object' && error !== null && 'code' in error) {
                const errorCode = (error as { code: string }).code;
                msg = this.getErrorMessage(errorCode)
            }
            else {
                msg = 'An unknown eror occured whilst requesting geolocation permission.'
            }

            console.error(`An error has occured whilst requesting geolocation permission. Error type: ${typeof error} Message: ${JSON.stringify(error)}`)
            hasPerm = false

            this.updatePermStatus(hasPerm, msg, StatusCodes.ERROR)
        }

        console.log("GeoLocService askPermission result: " + this._hasPermission)
        return this._hasPermission() ?? false
    }

    private updatePermStatus(hasPerm: boolean, message: string, statusCode: StatusCodes) {
        this._permMessage.set(message)
        this._permStatus.set(statusCode)
        this._hasPermission.set(hasPerm)
    }

    public async getPermissionState(): Promise<boolean> {
        if (this._hasPermission() == null) {
            const hasPerm = await this.restorePermState()
            if (hasPerm) {
                this.updatePermStatus(hasPerm, 'Permission granted', StatusCodes.OK)
                console.log(`1111111`)
                return hasPerm
            }
            this.updatePermStatus(hasPerm, 'Permission not granted', StatusCodes.WARN);
            console.log(`2222222222`)
            return hasPerm
        }
        return this._hasPermission() ?? false
    }

    private async restorePermState(): Promise<boolean> {
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
        // this._hasPermission.set(hasPerm)
        return hasPerm
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

    private getErrorMessage(errorCode: string) {
        let errorMsg = 'An error occured whilst obtaining location permission status.'
        // https://capacitorjs.com/docs/apis/geolocation#errors
        switch (errorCode) {
            case 'OS-PLUG-GLOC-0007':
                errorMsg += ` The location service/sensors are likely disabled. Enable them to continue.`
                break;
            case 'OS-PLUG-GLOC-0002':
                errorMsg += ' An unknown error trying to obtain the location.'
                break
            case 'OS-PLUG-GLOC-0003':
                errorMsg += ' Permission was denied. Enable them to continue.'
                break
            case 'OS-PLUG-GLOC-0008':
                errorMsg += ' (ios only) the app\'s use of locationservices was restricted.'
                break;
            case 'OS-PLUG-GLOC-0009':
                errorMsg += ' (android only) Request to enable was denied.'
                break
            case 'OS-PLUG-GLOC-0014':
                errorMsg += ' (android only) Google play services error user resolvable.'
                break;
            case 'OS-PLUG-GLOC-0015':
                errorMsg += ' (android only) Google play services error.'
                break
            case 'OS-PLUG-GLOC-0016':
                errorMsg += ' (android only) Location settings error.'
                break;
            case 'OS-PLUG-GLOC-0017':
                errorMsg += ' (android only) Unable to retrieve location because device has both Network and Location turned off.'
                break
            case 'OS-PLUG-GLOC-0018':
                errorMsg += ' (android only) Location permissions are not declared in manifest.'
                break;
            default:
                errorMsg += 'An unknown error occured.'
                break
        }
        return errorMsg
    }
}
