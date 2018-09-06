
import { Component, OnInit } from '@angular/core';
import { FirmService } from '../../../services/firm.service';
import { EntityService } from '../../../services/entity.service';
import { Firm } from './../../../models/firm';

@Component({
  selector: 'app-firms-index',
  templateUrl: './firms-index.component.html',
  styleUrls: ['./firms-index.component.css'],
  providers: [FirmService]
})
export class FirmsIndexComponent implements OnInit {
  
  subscription;

  count:number;
  isPromising: boolean = false;
  isLoading:boolean = true;
  firms:Firm[] = [];
  pageSizes: Array<Object> = [{ text: '10', value: 10 }, { text: '20', value: 20 }];
  pageSize: number = 10;
  currentPage: number = 0;

  constructor(private firmService: FirmService, private entityService: EntityService) { }

  ngOnInit() {
    
    this.subscription = this.entityService.queryParamSubject.subscribe(params => {
      this.isLoading = true;
      this.updateLocalParams(params);
      this.entityService.setCustomEndpoint('GetAll');
      let query = this.entityService.fromEntity('FFirm')
                  .expand(['Localization'])
                  .take(params['pageSize'])
                  .page(params['page'])
      
                  let sort = params["sort"] ? (typeof params["sort"] == 'string'  ? JSON.parse(params["sort"]) : params["sort"]) : null;          
      
      if(sort && sort[0]) {
        query.orderBy(sort[0]['sortBy'],sort[0]['type'])
      }
      if(params['search']) {
        query.search(params['search']['key'],params['search']['value']);
      }

      if(params['filter'] && params['filter'].length > 0) {
        query.whereRaw(params['fliter'][0].filter);
      }

      query.executeQuery();

    },
    error => console.log(error)
  );
    this.entityService.data.subscribe(firmsResult => {
        this.firms = firmsResult;
        this.isLoading = false;
    },error => console.log(error));

    this.entityService.getCount().subscribe( 
      count => this.count = count,
      error => console.log(<any>error)
    );
    this.firmService.isLoading.subscribe(
      isLoading => {
          if (!isLoading) {
              this.entityService.reload();
          }
      },
      error => console.log(<any>error)
  );
 
  }

  changePageSize(size) {
    this.entityService.setPageSize(size);
  }

  transistPage(page) {
    this.entityService.setPage(page);
  }

  updateLocalParams(params: Object = {}) {
    this.currentPage = params['page'] ? params['page'] : 0
    this.pageSize = params['pageSize'] ? params['pageSize'] : 10
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.entityService.data.next([]);
    this.entityService.flushOrder(false);
  }

  toggleSortTitle(sort) {
    this.entityService.setOrder(sort);
}
}
