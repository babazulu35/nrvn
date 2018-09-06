import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityService } from './../../services/entity.service';


@Component({
	selector: 'app-terminal',
	templateUrl: './terminal.component.html',
	styleUrls: ['./terminal.component.scss'],
	providers: [EntityService],
})
export class TerminalComponent implements OnInit {
	subscription;
	errorMessage: any;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private terminalEntityService: EntityService,
	) {
		this.terminalEntityService.setCustomEndpoint('GetAll');
	}

	ngOnInit() {
		if(this.route.snapshot.params && this.route.snapshot.params["id"]){
			let id = this.route.snapshot.params["id"];

			this.terminalEntityService.fromEntity('CTerminal')
				.where('Id', "=", id)
				.take(1).page(1).executeQuery();
		}
	}

}
