import { VenueBlock } from './../../../../models/venue-block';
import { BlockCapacity, BlockCapacityListComponent } from './../../components/block-capacity-list/block-capacity-list.component';
import { Component, OnInit, HostBinding, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';
import { cloneDeep } from 'lodash';

export class VenueBlockCapacity {
  block: VenueBlock;
  capacities: BlockCapacity[];
}

@Component({
  selector: 'app-block-capacity-box',
  templateUrl: './block-capacity-box.component.html',
  styleUrls: ['./block-capacity-box.component.scss']
})
export class BlockCapacityBoxComponent implements OnInit {
  @ViewChild(BlockCapacityListComponent) blockCapacityList: BlockCapacityListComponent;

  @HostBinding('class.oc-block-capacity-box') true;

  @Input() title: string;
  @Input() set venueBlockCapacity(venueBlockCapacity: VenueBlockCapacity) {
    this.block = venueBlockCapacity.block;
    this.capacities = venueBlockCapacity.capacities.filter( blockCapacity => blockCapacity.totalCapacity > 0 && blockCapacity.isActive);
  }
  @Input() block: VenueBlock;
  @Input() capacities: BlockCapacity[];

  private pristineCapacities: BlockCapacity[];
  
  public validation: {
    Capacity: { isValid: any, message: string }
	} = {
    Capacity: {
      message: "Doğru kapasite değerini giriniz",
			isValid(): boolean {
				return this.blockCapacityList ? this.blockCapacityList.isValid : true
			}
    }
  };

  public get isValid():boolean {
		if( this.validation
			&& this.validation.Capacity.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};
  
  constructor(
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if(!this.title) this.title = "KOLTUK SEÇİMİ";
    this.pristineCapacities = cloneDeep(this.capacities);
  }

  ngAfterViewInit() {
    this.changeDetector.detectChanges();
  }

  blockCapacityChangeHandler(event) {
    
  }

  public dismiss() {
    this.resetCapacities();
    this.tetherService.dismiss();
  }

  private resetCapacities() {
    let existBlocCapacity: BlockCapacity;
    this.pristineCapacities.forEach( pristineBlockCapacity => {
      existBlocCapacity = this.capacities.find( blockCapacity =>  blockCapacity.id == pristineBlockCapacity.id );
      if(existBlocCapacity) existBlocCapacity.currentCapacity = pristineBlockCapacity.currentCapacity;
    });
    if(!this.changeDetector["destroyed"]) this.changeDetector.detectChanges();
  }

  submitClickHandler(event) {
    this.tetherService.close(<VenueBlockCapacity>{block: this.block, capacities: this.capacities});
  }

}
