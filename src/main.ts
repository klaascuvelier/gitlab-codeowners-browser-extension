import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, { providers: [CommonModule] }).then(() => {
    console.log('Application bootstrapped');
});
