/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { main } from './app/views/main/main';

bootstrapApplication(main, appConfig).catch((err) => console.error(err));
