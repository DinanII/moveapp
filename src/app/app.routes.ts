import { Routes } from '@angular/router';
import { main } from './views/main/main';
import { PermissionsOverview } from './views/permissions-overview/permissions-overview';
import { ActivitiesOverview } from './views/activities-overview/activities-overview';
import { ActivityCreate } from './views/activity-create/activity-create';
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
        path: "activities/create",
        component: ActivityCreate
    }
];
