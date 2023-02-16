import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorageService {
    get(keys: string[]): Observable<Record<string, unknown>> {
        return new Observable((subscriber) => {
            chrome.storage.local
                .get(keys)
                .then((result: Record<string, unknown>) => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch((e: Error) => {
                    subscriber.error(e);
                    subscriber.complete();
                });
        });
    }

    set(data: Record<string, unknown>): Observable<void> {
        return new Observable((subscriber) => {
            chrome.storage.local
                .set(data)
                .then(() => {
                    subscriber.complete();
                })
                .catch((e: Error) => {
                    subscriber.error(e);
                    subscriber.complete();
                });
        });
    }
}
