import { Component, OnInit, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { AuthenticationService } from '../../../../services/authentication.service';

@Component({
    selector: 'app-multi-selection-bar',
    templateUrl: './multi-selection-bar.component.html',
    styleUrls: ['./multi-selection-bar.component.scss'],
})
export class MultiSelectionBarComponent implements OnInit {
    @Input() selectedItems: any;
    @Input() numberOfTotalItem: number;
    @Input() actionButtons: Array<Object>;
    @Output() toggleSelectedItems: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() transistAction: EventEmitter<string> = new EventEmitter<string>();
    @HostBinding('class.c-multi-selection-bar.col-xs-16.container-fluid') true;
    numberOfSelectedItems = 0;
    controlKeyPressed = false;

    get authorizedActionButtons(): Array<Object> {
        return this.actionButtons.filter(r =>  this.authenticationService.roleHasAuthenticate(r['role']));
    }

    @HostBinding('class.c-multi-selection-bar--active')
    get isActive(): boolean {
        return (this.selectedItems && this.selectedItems.length > 0)
                    && (this.authorizedActionButtons && this.authorizedActionButtons.length && this.authorizedActionButtons.length > 0);
    }
    @HostListener('window:keyup', ['$event']) onkeyup(event) {
        if (!this.controlKeyPressed && (event.keyCode == 91 || event.keyCode == 17)) this.controlKeyPressed = false;
    }
    @HostListener('window:keydown', ['$event']) onkeydown(event) {
        if (event.keyCode == 27) this.selectAll(false)
        if (!this.controlKeyPressed && (event.keyCode == 91 || event.keyCode == 17)) this.controlKeyPressed = true;
        if (this.controlKeyPressed && event.keyCode == 65 && document.activeElement.tagName !=='INPUT') {
            event.preventDefault();
            this.selectAll(true)
            this.controlKeyPressed = false;
        }
    }

    constructor(
        private authenticationService: AuthenticationService,
    ) {  }

    ngOnInit() {

    }

    selectAll(type: boolean) {
        this.toggleSelectedItems.emit(type);
    }

    transist(action: string) {
        this.transistAction.emit(action);
    }

}
