import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(err => {
  console.error(err);
  const fail = (window as unknown as { __ismsStartupFail?: (msg?: string) => void }).__ismsStartupFail;
  if (typeof fail === 'function') {
    fail('Unable to initialize ISMS 2.0. Please reload the page.');
  }
});
