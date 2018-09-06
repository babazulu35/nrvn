import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from '../../../../services/entity.service';

@Component({
  selector: 'app-cancel-block-select-product-box',
  templateUrl: './cancel-block-select-product-box.component.html',
  styleUrls: ['./cancel-block-select-product-box.component.scss'],
  providers: [EntityService],
})
export class CancelBlockSelectProductBoxComponent implements OnInit {
  @HostBinding('class.oc-transaction-refund-box') true;
  @Input() productIds: number[];
  options = [{text: 'Seçiniz', value: 0, disabled: true}];
  selectedProductId: number;
  subscription: any;
  isLoading = false;

  get isDisabled(): boolean {
    return this.selectedProductId === undefined || this.selectedProductId === 0;
  }

  constructor(
    public tetherDialog: TetherDialog,
    private entityService: EntityService,
  ) {
    this.entityService.setCustomEndpoint('GetAll');
  }

  ngOnInit() {
    if (this.productIds) {
      this.isLoading = true;
      let query = this.entityService.fromEntity('PProduct').expand(['Localization']);
      let whereClause = `Id eq ${this.productIds[0]}`;
      if (this.productIds.length > 1) {
        for (let i = 1; i < this.productIds.length; i++) {
          whereClause += `or Id eq ${this.productIds[i]}`
        }
      }
      query.whereRaw(whereClause).take(this.productIds.length).page(1).executeQuery();
      this.subscription = this.entityService.data.skip(1).first().subscribe(response => {
        if (response) {
          const productList = response.map(i => {return { text: i['Localization']['Name'], value: i.Id }});
          this.options = [...this.options, ...productList];
          this.isLoading = false;
        }
      }, error => {
        console.log(error);
        this.isLoading = false;
      });
    }
  }

  onInputChange(e) {
    this.selectedProductId = e;
  }

  submitClickHandler(e) {
    this.tetherDialog.close({
      selectedProductId: this.selectedProductId
    });
  }

}
