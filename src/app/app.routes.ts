import { Routes } from '@angular/router';
import { main } from './views/main/main';
import { PermissionsOverview } from './views/permissions-overview/permissions-overview';
import { ActivitiesOverview } from './views/activities-overview/activities-overview';
import { ActivityDetail } from './views/activity-detail/activity-detail';
import { Settings } from './views/settings/settings';
export const routes: Routes = [
    {
        path: "",
        component: main
    },
    {
        path: "permissions",
        component: PermissionsOverview
    },
    {
        path: "activities",
        component: ActivitiesOverview
    },
    {
        path: "activities/detail/:id",
        component: ActivityDetail
    },
    {
        path: "settings",
        component: Settings
    }
];
