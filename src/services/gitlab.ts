import { Injectable } from '@angular/core';
import { Gitlab, Types } from '@gitbeaker/browser';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GitlabService {
  static token = 'YOUR_TOKEN_HERE';

  get gitlab() {
    return new Gitlab({
      token: GitlabService.token,
      host: 'https://gitlab.showpad.io',
    });
  }

  getUser(): Observable<Types.UserSchema> {
    return new Observable((subscriber) => {
      this.gitlab.Users.current()
        .then((response) => {
          subscriber.next(response);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }

  getProjectIdByProjectSlug(
    namespace: string,
    projectSlug: string
  ): Observable<number> {
    return new Observable((subscriber) => {
      this.gitlab.Projects.search(projectSlug)
        .then((response) => {
          const project = response.find(
            (project) =>
              project.name.toLocaleLowerCase() ===
                projectSlug.toLocaleLowerCase() &&
              project.namespace.name.toLocaleLowerCase() ===
                namespace.toLocaleLowerCase()
          );
          if (project) {
            subscriber.next(project.id);
            subscriber.complete();
          } else {
            subscriber.error(
              new Error(`Project "${projectSlug}" not found in "${namespace}"`)
            );
          }
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
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
