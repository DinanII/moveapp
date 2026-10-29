import { Service, signal } from '@angular/core';
import { DatabaseManager } from './DatabaseManager';
import { Observable } from 'rxjs';
import { RecordedLocation } from '../interfaces/recorded-location';
import { Activity } from '../interfaces/activity';
@Service()
export class ActivityService {

    private activityId: number = -1

    // private writable state
    private readonly _activities = signal<Activity[]>([]);
    // public readonly
    public readonly activities = this._activities.asReadonly()

    private readonly _isActivityOngoing = signal<boolean>(false);
    // public readonly
    public readonly isActivityOngoing = this._isActivityOngoing.asReadonly()

    private currentOffset: number = 0

    private activitiesLoaded: boolean = false

    private isMaxPageReached: boolean = false

    async createActivity(activityName: string, categoryId: number): Promise<number> {
        if (!await this.isDatabaseReady() || categoryId < 1 || this.isActivityOngoing()) return -1
        const newActivity: Activity = {
            activityId: -1,
            activityName: activityName,
            acatId: categoryId,
            startedAt: Math.floor(Date.now() / 1000),
            endedAt: null,
        }
        const insertResult = await DatabaseManager.performQuery(
            "modify",
            "INSERT INTO activities (ac_name, ac_started_at, ac_ended_at, ac_acat_id) VALUES (?, ?, ?, ?)",
            [newActivity.activityName, newActivity.startedAt, newActivity.endedAt, newActivity.acatId]
        )
        if (insertResult != null && insertResult.changes) {
            console.log(`The changes: `, JSON.stringify(insertResult))
            console.log(`Typeof ${typeof insertResult}`)
            this.activityId = insertResult.changes.lastId ?? -1
            this._activities.update((activities) => {
                return [newActivity, ...activities]
            })
            this._isActivityOngoing.set(true)
            return this.activityId
        }
        console.error(`Insert activity Failed! ${JSON.stringify(insertResult)}`)
        return -1
    }

    getCurrentOffset() {
        return this.currentOffset
    }

    async endActivity(activityId: number): Promise<boolean> {
        if (!await this.isDatabaseReady()) return false
        // set activity.end to Date.now()
        this._isActivityOngoing.set(false)
        return false
    }

    async isDatabaseReady(): Promise<Observable<boolean>> {
        return DatabaseManager.dbReady$
    }

    async retrieveActivities(offset: number = this.currentOffset): Promise<number> {
        if (!await this.isDatabaseReady() || this.activitiesLoaded) return 0

        const getResult = await DatabaseManager.performQuery(
            'search',
            'SELECT * FROM activities ORDER BY ac_id DESC',
            [],
            offset
        )
        console.log(`RetrieveActivities: ${JSON.stringify(getResult)}`)

        if (getResult && "values" in getResult && getResult.values) {
            const retrievedActivities: Activity[] = getResult.values.map((row) => ({
                activityId: Number(row["ac_id"]),
                activityName: String(row["ac_name"]),
                startedAt: Number(row["ac_started_at"]) * 1000,
                endedAt: row["ac_ended_at"] === null ? null : Number(row["ac_ended_at"]) * 1000,
                acatId: Number(row["ac_acat_id"]),
            }));
            if (retrievedActivities.length < DatabaseManager.pageSize) {
                this.isMaxPageReached = true
            }
            this._activities.update((activities) => {
                return retrievedActivities
            })
            return retrievedActivities.length
            // this.currentOffset += DatabaseManager.pageSize
        }
        return 0
    }

    async pageBack(): Promise<boolean> {
        const desiredOffset = this.currentOffset -= DatabaseManager.pageSize
        if (desiredOffset >= 0) {
            const num = await this.retrieveActivities(desiredOffset)
            if (this.isMaxPageReached) this.isMaxPageReached = false
            if (this.currentOffset == 0) return false
            return true
        }
        return false
    }

    async pageNext() {
        const desiredOffset = this.currentOffset += DatabaseManager.pageSize
        await this.retrieveActivities(desiredOffset)
        if (this.isMaxPageReached) return false
        return true
    }

    async retrieveActivityLocations(offset: number, activityId: number): Promise<RecordedLocation[]> {
        if (!await this.isDatabaseReady() || this.activitiesLoaded || activityId < 1) return []

        const getResult = await DatabaseManager.performQuery(
            'search',
            'SELECT * FROM geolocation_points WHERE glp_ac_id = ?',
            [activityId],
            offset
        )
        console.log(`retrieveActivityLocations: ${JSON.stringify(getResult)}`)

        if (getResult && "values" in getResult && getResult.values) {
            const retrievedLocations: RecordedLocation[] = getResult.values.map((row) => ({
                accuracy: row['glp_accuracy'],
                latitude: row['glp_latitude'],
                longitude: row['glp_longitude'],
                locationIndex: row['glp_index'],
                timestamp: Number(row['glp_timestamp']) * 1000,
            }));
            return retrievedLocations
        }
        return []
    }

    async hasUnfinishedActivity(): Promise<number> {
        if (!await this.isDatabaseReady()) return -1
        // const query = "SELECT EXISTS(SELECT 1 FROM activities WHERE ac_ended_at IS NULL) AS has_unfinished_activity;"
        const selectResult = await DatabaseManager.performQuery("search", "SELECT ac_id FROM activities AS unfinished_activity WHERE ac_ended_at IS NULL LIMIT 1")
        // console.log(`Result: ${JSON.stringify(selectResult)}`)
        console.log(`Value to compare:`, JSON.stringify(selectResult?.values ?? null))
        if (selectResult && selectResult.values && Array.isArray(selectResult.values) && selectResult.values.length > 0 && selectResult.values[0]["ac_id"] && !Number.isNaN(selectResult.values[0]["ac_id"])) {
            return selectResult.values[0]["ac_id"]
        }
        return -1
    }

    async storeLocationPoint(location: RecordedLocation): Promise<boolean> {
        if (!await this.isDatabaseReady() && this.activityId < 1) return false

        const insertResult = await DatabaseManager.performQuery(
            "modify",
            "INSERT INTO geolocation_points (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (?, ?, ?, ?, ?, ?)",
            [location.latitude, location.longitude, this.activityId, location.locationIndex, location.timestamp, location.accuracy]
        )
        if (insertResult != null && insertResult.changes) {
            console.log(`The changes: `, JSON.stringify(insertResult))
            console.log(`Typeof ${typeof insertResult}`)
            if (insertResult.changes.lastId && !isNaN(insertResult.changes.lastId)) {
                return true
            }
        }
        return false
    }


}
