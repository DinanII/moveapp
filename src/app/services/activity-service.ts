import { Service } from '@angular/core';
import { DatabaseManager } from './DatabaseManager';
import { Observable } from 'rxjs';

@Service()
export class ActivityService {

    async createActivity(activityName: string): Promise<number> {
        if (!this.isDatabaseReady) return -1
        const insertResult = await DatabaseManager.performQuery(
            "modify",
            "INSERT INTO activities (ac_name, ac_started_at, ac_ended_at) VALUES (?, ?, ?)",
            [activityName, Math.floor(Date.now() / 1000), null]
        )
        if (insertResult != null && insertResult.changes) {
            console.log(`The changes: `, JSON.stringify(insertResult))
            console.log(`Typeof ${typeof insertResult}`)
            return insertResult.changes.lastId ?? -1
        }
        return -1
    }

    async endActivity(activityId: number): Promise<boolean> {
        if (!this.isDatabaseReady) return false
        // set activity.end to Date.now()
        return false
    }

    async isDatabaseReady(): Promise<Observable<boolean>> {
        return DatabaseManager.dbReady$
    }
}
