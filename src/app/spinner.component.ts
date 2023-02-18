import { Component, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'spinner',
    template: `<div
        class="lds-dual-ring"
        [style.width.px]="size"
        [style.height.px]="size"
    ></div>`,
    styles: [
        `
            .lds-dual-ring {
                display: inline-block;
            }
            .lds-dual-ring:after {
                content: ' ';
                display: block;
                width: 64px;
                height: 64px;
                margin: 8px;
                border-radius: 50%;
                border: 6px solid #fff;
                border-color: #999 transparent;
                animation: lds-dual-ring 1.2s linear infinite;
            }
            @keyframes lds-dual-ring {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `,
    ],
})
export class SpinnerComponent {
    @Input() size = 28;
}
