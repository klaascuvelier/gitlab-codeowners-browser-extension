import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { switchMap, Subject, take, takeUntil } from 'rxjs';
import { GitlabService } from 'src/services/gitlab';
import { StorageService } from 'src/services/storage.service';
import { ExtensionHostService } from '../services/extension-host-service';
import { HelperService } from '../services/helper';
import { ConfigComponent } from './config.component';

@Component({
    standalone: true,
    selector: 'gitlab-codeowners-browser-extension-root',
    imports: [ConfigComponent, CommonModule],
    template: `
        <config
            [token]="token"
            [host]="host"
            (configChange)="saveConfig($event)"
        ></config>

        <button (click)="initCodeOwners()">Go</button>

        {{ status }}
    `,
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent implements OnDestroy, OnInit {
    private helper = inject(HelperService);
    private extensionHost = inject(ExtensionHostService);
    private cdRef = inject(ChangeDetectorRef);
    private storage = inject(StorageService);
    private gitlab = inject(GitlabService);
    private destroy$ = new Subject<void>();

    status: undefined | string = undefined;
    token: undefined | string = undefined;
    host: undefined | string = undefined;

    ngOnInit() {
        this.storage
            .get(['host', 'token'])
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ host, token }) => {
                this.host = host as string | undefined;
                this.token = token as string | undefined;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get needsConfig() {
        return this.token === undefined || this.host === undefined;
    }

    saveConfig({ token, host }: { token: string; host: string }) {
        this.token = token;
        this.host = host;

        this.storage
            .set({ token, host })
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }

    initCodeOwners() {
        if (this.needsConfig) {
            this.status = 'config';
            return;
        } else {
            this.gitlab.token = this.token as string;
            this.gitlab.host = this.host as string;
        }

        this.status = 'loading';
        this.extensionHost
            .getUrl()
            .pipe(
                take(1),
                switchMap((url) => this.helper.getMyRequiredApprovals(url)),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (a) => {
                    this.status = 'ready';
                    console.log(a);
                    console.log('ok');
                    this.cdRef.detectChanges();
                },
                error: () => {
                    this.status = 'error';
                },
            });
    }
}
