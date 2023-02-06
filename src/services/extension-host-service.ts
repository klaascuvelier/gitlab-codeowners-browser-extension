import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExtensionHostService {
  getUrl(): Observable<string> {
    return this.getActiveTab().pipe(map((tab) => tab?.url ?? ''));
  }

  getActiveTab(): Observable<chrome.tabs.Tab | null> {
    return new Observable((subscriber) => {
      chrome.tabs.query({ active: true }, (tabs) => {
        subscriber.next(tabs[0] ?? null);
        subscriber.complete();
      });
    });
  }
}
