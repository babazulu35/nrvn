import { Component, OnInit, HostBinding, ViewChild } from '@angular/core';
import { TetherDialog } from '../../modules/tether-dialog/tether-dialog';

import { TypeaheadComponent } from '../typeahead/typeahead.component';

@Component({
  selector: 'app-header-search-bar',
  templateUrl: './header-search-bar.component.html',
  styleUrls: ['./header-search-bar.component.scss']
})
export class HeaderSearchBarComponent implements OnInit {
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;

  @HostBinding('class.c-header-search-bar') true;
  
  dismissEventSubscription:any;

  constructor(
    public tetherService: TetherDialog
  ) { 
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if(this.typeahead) {
      this.dismissEventSubscription = this.typeahead.dismissEvent.subscribe( (result) => this.tetherService.dismiss() );
    }
  }

  ngOnDestroy() {
    if(this.dismissEventSubscription) this.dismissEventSubscription.unsubscribe();
  }

  public submit() {
    let result = {
      status: "Sent from Header search bar"
    };
    this.tetherService.close(result);
  }

}
