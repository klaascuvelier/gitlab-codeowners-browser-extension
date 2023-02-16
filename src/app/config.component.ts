import {
    Component,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule],
    selector: 'config',
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
export class ConfigComponent implements OnChanges {
    @Input() token: string | undefined;
    @Input() host: string | undefined;
    @Output() configChange = new EventEmitter<{
        token: string;
        host: string;
    }>();

    form = new FormGroup({
        token: new FormControl(''),
        host: new FormControl(''),
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['token']) {
            this.form.patchValue({
                token: changes['token'].currentValue,
            });
        }
        if (changes['host']) {
            this.form.patchValue({
                host: changes['host'].currentValue,
            });
        }
    }

    onSubmit() {
        this.configChange.emit(
            this.form.value as { token: string; host: string }
        );
    }
}
