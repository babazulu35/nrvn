import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { VenueEditorSeat } from './../../../../models/venue-editor-seat';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter, ViewChild, QueryList, ViewChildren } from '@angular/core';

export class BlockCapacity {
  id: any;
  title: string;
  type: string;
  filter?: any;
  isActive?: boolean = true;
  currentCapacity?: number;
  availableCapacity?: number;
  totalCapacity?: number;
  previousCapacity?: number;
  availableSeats?: VenueEditorSeat[];
  currentSeats?: VenueEditorSeat[];
}

@Component({
  selector: 'app-block-capacity-list',
  templateUrl: './block-capacity-list.component.html',
  styleUrls: ['./block-capacity-list.component.scss']
})
export class BlockCapacityListComponent implements OnInit {
  @ViewChildren(TextInputComponent) textInputs: QueryList<TextInputComponent>;

  @HostBinding('class.c-block-capacity-list') true;

  @Output() changeEvent: EventEmitter<BlockCapacity[]> = new EventEmitter();

  @Input() title: string;
  @Input() totalCapacity: number;
  @Input() items: BlockCapacity[];
  @Input() caption: {
    title?: string,
    current?: string,
    total?: string
  }
  @Input() readonly: boolean;

  public validation: {
    HasError: { isValid: any, message: string },
	} = {
    HasError: {
      message: "Alanlarda hata var",
      isValid(): any {
        return this.textInputs ? !this.textInputs.toArray().some( item => {return item.hasError}) : true;
      }
    },
  };

  public get isValid():boolean {
		if( this.validation
      && this.validation.HasError.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  constructor() { }

  ngOnInit() {
    if(!this.caption) this.caption = {
      title: "ADI",
      current: "KAPASİTE",
      total: "UYGUN / MAKS."
    }
  }

  inputChangeHandler(event, item) {
    item.currentCapacity = event;
    this.changeEvent.emit(this.items);
  }

}
