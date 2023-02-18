import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from 'src/services/storage.service';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule],
    selector: 'config-container',
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <label>
                Host
                <input type="text" formControlName="host" />
            </label>
            <label>
                Token
                <input type="password" formControlName="token" />
            </label>
            <button>Save</button>
        </form>
    `,
})
export default class ConfigContainer implements OnInit, OnDestroy {
    private storage = inject(StorageService);
    private destroy$ = new Subject<void>();

    token: undefined | string = undefined;
    host: undefined | string = undefined;

    form = new FormGroup({
        token: new FormControl(''),
        host: new FormControl(''),
    });

    ngOnInit() {
        this.storage
            .get(['host', 'token'])
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ host, token }) => {
                this.form.patchValue({
                    host: (host as string) ?? '',
                    token: (token as string) ?? '',
                });
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit() {
        this.saveConfig(this.form.value as { token: string; host: string });
    }

    saveConfig({ token, host }: { token: string; host: string }) {
        this.token = token;
        this.host = host;

        this.storage
            .set({ token, host })
            .pipe(takeUntil(this.destroy$))
            .subscribe();
    }
}
