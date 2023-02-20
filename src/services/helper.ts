import { Gitlab } from '@gitbeaker/browser';

export type HelperConfig = { host: string; token: string };

export class HelperService {
    private static mergeRequestRegexp =
        /([a-z0-9\\-]+)\/([a-z0-9\\-]+)\/-\/merge_requests\/(\d+)/;

    constructor(private config: HelperConfig) {}

    async getMyRequiredApprovals(url: string) {
        const a = require('../tmp.json');
        return a;

        const gitlab = new Gitlab({
            host: this.config.host,
            token: this.config.token,
        });

        if (!HelperService.mergeRequestRegexp.test(url)) {
            return null;
        }

        const [, namespace, projectName, mergeRequestId] =
            url.match(
                /([a-z0-9\\-]+)\/([a-z0-9\\-]+)\/-\/merge_requests\/(\d+)/
            ) ?? [];

        const project = await gitlab.Projects.search(projectName).then(
            (response) => {
                return (
                    response.find(
                        (item) =>
                            item.name.toLocaleLowerCase() ===
                                projectName.toLocaleLowerCase() &&
                            item.namespace.name.toLocaleLowerCase() ===
                                namespace.toLocaleLowerCase()
                    ) ?? null
                );
            }
        );

        if (!project) {
            return;
        }

        const [approvalRules, user] = await Promise.all([
            gitlab.MergeRequestApprovals.approvalRules(project.id, {
                mergerequestIid: parseInt(mergeRequestId, 10),
            }),
            gitlab.Users.current(),
        ]);

        return (approvalRules ?? []).filter((rule) => {
            return (
                rule.rule_type === 'code_owner' &&
                (rule.users ?? []).some((item) => item.id === user.id)
            );
        });
    }
}
