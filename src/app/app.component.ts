import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { switchMap, Subject, take, takeUntil } from 'rxjs';
import { ExtensionHostService } from '../services/extension-host-service';
import { HelperService } from '../services/helper';

@Component({
  selector: 'gitlab-codeowners-browser-extension-root',
  template: ` <button (click)="initCodeOwners()">Click me!</button> `,

  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  helper = inject(HelperService);
  extensionHost = inject(ExtensionHostService);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    alert('init');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCodeOwners() {
    this.extensionHost
      .getUrl()
      .pipe(
        take(1),
        switchMap((url) => this.helper.getMyRequiredApprovals(url)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (a) => {
          console.log(a);
        },
        complete: () => {
          console.log('complete');
          alert('done');
        },
      });
  }
}
