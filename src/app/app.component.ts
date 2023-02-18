import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from 'src/services/storage.service';

@Component({
    standalone: true,
    selector: 'gitlab-codeowners-browser-extension-root',
    imports: [CommonModule, RouterOutlet, RouterLink],
    template: ` <router-outlet></router-outlet>`,
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private storage = inject(StorageService);
    private router = inject(Router);

    ngOnInit(): void {
        const isExtensionPopup = window.location.search.includes('popup=1');

        this.storage
            .get(['host', 'token'])
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ host, token }) => {
                if (isExtensionPopup) {
                    this.router.navigateByUrl('/about');
                } else if (!host || !token) {
                    this.router.navigateByUrl('/config');
                } else {
                    this.router.navigateByUrl('/tree');
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }
}
