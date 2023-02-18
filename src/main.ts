import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/routes';

bootstrapApplication(AppComponent, {
    providers: [CommonModule, provideRouter(routes)],
}).then(() => {
    console.log('Application bootstrapped');
});
