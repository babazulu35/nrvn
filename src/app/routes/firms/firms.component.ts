

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EntityService } from './../../services/entity.service';
import { FirmService } from './../../services/firm.service';
import { HeaderTitleService } from '../../services/header-title.service';
import { AuthenticationService } from './../../services/authentication.service';


@Component({
  selector: 'app-firms',
  templateUrl: './firms.component.html',
  styleUrls: ['./firms.component.scss'],
  providers: [EntityService]
})
export class FirmsComponent implements OnInit {
  isAuthenticatedRole:boolean;

  constructor(public entityService: EntityService,public  headerTitleService: HeaderTitleService,private authenticationService:AuthenticationService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
		this.headerTitleService.setTitle('Firmalar');
		this.headerTitleService.setLink('/firms');
 
  }  
	onInputChange(event) {
		this.entityService.setSearch({ key: 'Localization/Name', value: event })
	}
	
}
