import { Gitlab, Types } from '@gitbeaker/browser';

export class GitlabService {
    token: string | null = null;
    host: string | null = null;

    get gitlab() {
        if (!this.token || !this.host) {
            throw new Error(`Gitlab token or host not correctly configured`);
        }

        return new Gitlab({
            token: this.token,
            host: this.host,
        });
    }

    getMergeRequestChanges(
        projectId: string,
        mergeRequestId: number
    ): Promise<Types.MergeRequestSchema> {
        return this.gitlab.MergeRequests.changes(projectId, mergeRequestId);
    }

    getMergeRequestApprovalRules(
        projectId: number,
        mergeRequestId: number
    ): Observable<Types.MergeRequestLevelApprovalRuleSchema[]> {
        return new Observable((subscriber) => {
            this.gitlab.MergeRequestApprovals.approvalRules(projectId, {
                mergerequestIid: mergeRequestId,
            })
                .then((response) => {
                    subscriber.next(response);
                    subscriber.complete();
                })
                .catch((error) => {
                    subscriber.error(error);
                });
        });
    }

    getMergeRequest(
        projectId: number,
        mergeRequestId: number
    ): Observable<Types.MergeRequestSchema> {
        return new Observable((subscriber) => {
            this.gitlab.MergeRequests.show(projectId, mergeRequestId)
                .then((response) => {
                    subscriber.next(response);
                    subscriber.complete();
                })
                .catch((error) => {
                    subscriber.error(error);
                });
        });
    }
}
