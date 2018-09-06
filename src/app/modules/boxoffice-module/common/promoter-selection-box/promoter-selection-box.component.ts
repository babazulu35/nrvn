import { Component, OnInit, ChangeDetectorRef, Input, HostListener } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { EntityService } from '../../../../services/entity.service';
import { Observable } from 'rxjs/Observable';
import { Firm } from '../../../../models/firm';

class FirmListModel {
  FirmId: string;
  list: {
    id: any;
    title: string;
    icon?: string;
    description?: string;
    params?: any[];
  }
};

@Component({
  selector: 'app-promoter-selection-box',
  templateUrl: './promoter-selection-box.component.html',
  styleUrls: ['./promoter-selection-box.component.scss'],
  providers: [EntityService],
})
export class PromoterSelectionBoxComponent implements OnInit {
  promoterSelectSearchResults: Observable<{}> | Observable<FirmListModel[]>;
  @Input() existingPromoters: any[];

  isPromising = false;
  selectedFirm: any;

  constructor(
    private entityService: EntityService,
    public changeDetector: ChangeDetectorRef,
    public tetherDialog: TetherDialog,
  ) { }

  ngOnInit() {
      this.entityService.setCustomEndpoint('GetAll');
      this.entityService.data.subscribe(promoters => {
        if (promoters) {
          let result: {}[] = [];
          promoters.forEach(promoter => {
            if (promoter && !this.existingPromoters.some(p => p.PromoterId === promoter.Id)) {
              result.push({
                id: promoter['Id'],
                title: promoter['Localization']['Name'],
                icon: 'work',
                params: {promoter: promoter}
              })
            }
          });
          this.promoterSelectSearchResults = Observable.of([{
            title: 'ARAMA SONUÇLARI',
            list: result
          }]);
          this.isPromising = false;
        }
      })
  }

  promoterSelectSearchHandler(event) {
    this.isPromising = true;
    this.entityService
      .fromEntity('FFirm')
      .search('Localization/Name', event)
      .where('IsPlatform','=','false')
      .expand(['Localization'])
			.take(100)
      .page(0)
      .executeQuery();
  }

	promoterSelectResultHandler(event) {
    this.selectedFirm = event.params.promoter;
  }

  submitClickHandler(event?: any) {
    this.tetherDialog.close({promoter: this.selectedFirm});
  }

	promoterSelectActionHandler(event) {
	}

	promoterSelectDismissHandler(event) {
  }
}
