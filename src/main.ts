import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/views/main/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
