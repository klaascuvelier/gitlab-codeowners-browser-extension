import { inject, Injectable } from '@angular/core';
import { EMPTY, forkJoin, map, Observable, switchMap, throwError } from 'rxjs';
import { GitlabService } from './gitlab';

@Injectable({ providedIn: 'root' })
export class HelperService {
    private static mergeRequestRegexp =
        /([a-z0-9\\-]+)\/([a-z0-9\\-]+)\/-\/merge_requests\/(\d+)/;

    private gitlabService = inject(GitlabService);

    getMyRequiredApprovals(url: string): Observable<unknown> {
        if (!HelperService.mergeRequestRegexp.test(url)) {
            return EMPTY;
        }

        const [, namespace, project, mergeRequestId] =
            url.match(
                /([a-z0-9\\-]+)\/([a-z0-9\\-]+)\/-\/merge_requests\/(\d+)/
            ) ?? [];

        const approvalRules$ = this.gitlabService
            .getProjectIdByProjectSlug(namespace, project)
            .pipe(
                switchMap((projectId) => {
                    if (!projectId) {
                        return throwError(
                            () => new Error(`Project "${project}" not found`)
                        );
                    }

                    return this.gitlabService.getMergeRequestApprovalRules(
                        projectId,
                        parseInt(mergeRequestId, 10)
                    );
                })
            );

        return forkJoin([approvalRules$, this.gitlabService.getUser()]).pipe(
            map(([rules, user]) => {
                return rules.filter((rule) =>
                    rule.eligible_approvers?.some(
                        (approver) => approver.id === user.id
                    )
                );
            })
        );
    }
}
