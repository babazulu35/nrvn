import { Component, OnInit, Input } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';

@Component({
  selector: 'app-expiration-date-picker-box',
  templateUrl: './expiration-date-picker-box.component.html',
  styleUrls: ['./expiration-date-picker-box.component.scss'],
})
export class ExpirationDatePickerBoxComponent implements OnInit {

    @Input() performance: any;
    newExpirationDate: any;
    today = new Date();

    constructor(
        private tetherService: TetherDialog,
    ) { }

    ngOnInit() {

    }

    inputChangeHandler(event) {
        if (!event) return;
        this.newExpirationDate = event;
    }

    close(e) {
        this.tetherService.close({
            NewExpirationDate: this.newExpirationDate
        })
    }

    cancel(e) {
        this.tetherService.dismiss();
    }
}
