import { ReservationSeat } from './../../models/reservation-seat';
import { Component, OnInit, HostBinding, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CrmAnonymousUser } from '../../../../../../models/crm-anonymous-user';

export class CustomerCapacity {
  id: any;
  customer: CrmAnonymousUser;
  capacity: number;
  isDisabled?: boolean;
  isSelected?:boolean;
}

@Component({
  selector: 'app-customer-capacity-select-list',
  templateUrl: './customer-capacity-select-list.component.html',
  styleUrls: ['./customer-capacity-select-list.component.scss']
})
export class CustomerCapacitySelectListComponent implements OnInit {
  @HostBinding('class.c-customer-capacity-select-list') true;

  @Output() changeEvent:EventEmitter<CustomerCapacity> = new EventEmitter();

  @Input() items: CustomerCapacity[];
  @Input() selectedItem: CustomerCapacity;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if(this.selectedItem) this.selectItem(this.selectedItem);
  }

  ngOnChanges(changes) {
    if(changes.selectedItem && !changes.selectedItem.previousValue) this.selectItem(changes.selectedItem.currentValue);
  }

  itemClickHandler($event, item) {
    this.selectItem(item)
  }

  selectItem(item) {
    if(!item || item.isDisabled) return;
    this.selectedItem = item;
    this.items.map( existItem => existItem.isSelected = existItem == this.selectedItem );
    this.changeEvent.emit(this.selectedItem);
    this.changeDetector.detectChanges();
  }

}
