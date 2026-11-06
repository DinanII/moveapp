import { Service } from '@angular/core';

@Service()
export class DateUtilsService {
    /**
     * Function to obtain unixtime in seconds.
     * @returns unixtime in seconds
     */
    public getUnixTime(): number {
        return Math.floor(Date.now() / 1000)
    }

    public formatDuration(seconds: number | null): string {
        if (!seconds) return ''
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor((seconds % 60))
        return `${h}h ${m}m ${s}s`
    }
}
//   protected formatDuration(ms: number | null) {
//     if (!ms) return ''
//     const h = Math.floor(ms / 3600000)
//     const m = Math.floor((ms % 3600000) / 60000)
//     const s = Math.floor((ms % 60000) / 1000)
//     return `${h}h ${m}m ${s}s`

//   }