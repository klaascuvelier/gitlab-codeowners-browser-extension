import { Component, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'file-tree',
    template: `<div></div>`,
})
export class FileTreeComponent {
    @Input() mergeRequestChanges: unknown[] | undefined;
    @Input() myRequiredApprovals: unknown[] | undefined;

    tree = [];

    ngOnChanges(): void {
        this.tree = this.buildTree(
            this.mergeRequestChanges,
            this.myRequiredApprovals
        );
    }

    buildTree(
        mergeRequestChanges: unknown[] | undefined,
        myRequiredApprovals: unknown[] | undefined
    ): unknown[] {
        return [];
    }
}
