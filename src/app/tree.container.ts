import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { forkJoin, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ExtensionHostService } from 'src/services/extension-host-service';
import { GitlabService } from 'src/services/gitlab';
import { HelperService } from 'src/services/helper';
import { StorageService } from 'src/services/storage.service';
import { FileTreeComponent } from './file-tree.component';
import { SpinnerComponent } from './spinner.component';

@Component({
    standalone: true,
    selector: 'tree-container',
    imports: [SpinnerComponent, CommonModule, FileTreeComponent],
    template: `{{ status }}
        <ng-container [ngSwitch]="status">
            <spinner *ngSwitchCase="'loading'"></spinner>
            <file-tree
                *ngSwitchCase="'ready'"
                [mergeRequestChanges]="mrChanges"
                [myRequiredApprovals]="requiredApprovals"
            ></file-tree>
        </ng-container> `,
})
export default class TreeContainer implements OnInit, OnDestroy {
    private helper = inject(HelperService);
    private extensionHost = inject(ExtensionHostService);
    private cdRef = inject(ChangeDetectorRef);
    private gitlab = inject(GitlabService);
    private storage = inject(StorageService);
    private destroy$ = new Subject<void>();

    status = 'loading';

    mrChanges: undefined | unknown[];
    requiredApprovals: undefined | unknown[];

    ngOnInit() {
        this.storage
            .get(['host', 'token'])
            .pipe(takeUntil(this.destroy$))
            .subscribe(({ host, token }) => {
                this.initCodeOwners(host as string, token as string);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    initCodeOwners(host: string, token: string) {
        this.gitlab.host = host;
        this.gitlab.token = token;

        this.status = 'loading';
        this.extensionHost
            .getUrl()
            .pipe(
                take(1),
                switchMap((url) =>
                    forkJoin([
                        this.helper.getMyRequiredApprovals(url),
                        this.helper.getMergeRequestChanges(url),
                    ])
                ),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: ([approvalRules, changes]) => {
                    this.requiredApprovals = approvalRules;
                    this.mrChanges = changes;

                    this.status = 'ready';
                    this.cdRef.detectChanges();
                },
                error: (e) => {
                    console.log(e);
                    this.status = 'error';
                    this.cdRef.detectChanges();
                },
            });
    }
}
