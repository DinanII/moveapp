import { Routes } from '@angular/router';
import { main } from './views/main/main';
import { PermissionsOverview } from './views/permissions-overview/permissions-overview';
export const routes: Routes = [
    {
        path: "",
        component: main
    },
    {
        path: "permissions",
        component: PermissionsOverview
    }
];
