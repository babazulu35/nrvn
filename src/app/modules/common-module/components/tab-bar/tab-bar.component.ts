import { cloneDeep } from 'lodash';
import { TetherDialog } from './../../modules/tether-dialog/tether-dialog';
import { Component, OnInit, HostBinding, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthenticationService } from '../../../../services/authentication.service';

export class TabItem {
	label: string;
	routerLink: string;
	selected?: boolean;
	params?: any
}

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})

export class TabBarComponent implements OnInit {
	@HostBinding('class.c-tab-bar') true;
	@HostBinding('class.c-tab-bar--white') private themeIsLight:boolean;

	@Output() changeEvent: EventEmitter<TabItem> = new EventEmitter(null);

	@Input() maxVisibleCount = 6;
	@Input() showHiddenSelectedItem = true;

	@Input() set theme(value: string) {
		this.themeIsLight = value === 'light';
	}

	@Input() set data(data) {
		if (Array.isArray(data)) {
			this.items = [];
			data.forEach(item => {
				if (this.authenticationService.roleHasAuthenticate(item['params']['role'])) {
					this.items.push({
						label: item.label,
						routerLink: item.routerLink,
						selected: item.selected,
						params: item.params
					})
				}
			})
		}
	};

	items: TabItem[];

	get visibleItems() {
		if (this.maxVisibleCount < this.items.length) {
			return this.items.slice(0, this.maxVisibleCount);
		}else {
			return this.items;
		}
	}

	get hiddenItems() {
		if (this.maxVisibleCount < this.items.length) {
		  return this.items.slice(this.maxVisibleCount, this.items.length);
		} else {
		  return null;
		}
	  }

	get selectedItem(): TabItem {
		return (this.items) ? this.items.find( item => item['selected'] === true ) : null;
	}

	get hiddenSelectedItem() {
		return(this.hiddenItems) ? this.hiddenItems.find( item => item['selected'] === true ) : [];
	}

	get hiddenMenuData() {
		let contextMenuData: {action: string, label: string, icon?: string, params?: any}[] = [];
		if (this.hiddenItems) this.hiddenItems.forEach( item => contextMenuData.push({
			action: 'gotoLink',
			label: item.label,
			params: {routerLink: item.routerLink}
		}));
		return contextMenuData;
	}

	private initItems: TabItem[];

	constructor(
		private tetherService: TetherDialog,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private changeDetector: ChangeDetectorRef,
		private authenticationService: AuthenticationService,
	) { }

	ngOnInit() {
		if (!this.initItems) this.initItems = cloneDeep(this.items);
		this.router.events.subscribe( event => {
			if (event instanceof NavigationEnd) {
				if (this.activatedRoute.firstChild) this.selectItemByRouterLink(this.activatedRoute.firstChild.snapshot.url.join('/'));
			}
		})
		if (this.activatedRoute.firstChild) this.selectItemByRouterLink(this.activatedRoute.firstChild.snapshot.url.join('/'));
	}

	openHiddenItems(e) {
		this.tetherService.context({
			title: 'DİĞER BAŞLIKLAR',
			data: this.hiddenMenuData
		}, {target: e.target, attachment: 'top right', targetAttachment: 'top right'}).then( result => {
			switch (result.action) {
				case 'gotoLink':
					// this.selectItemByRouterLink(result.params.routerLink);
					if (result.params.routerLink) this.router.navigate([result.params.routerLink], {relativeTo: this.activatedRoute});
				break;
			}
		}).catch(error => {});
	};

	selectItemByRouterLink(routerLink: string) {
		this.selectItem(this.items.find( item => item.routerLink === routerLink));
	}

	selectItem(item) {
		if (!this.items || !this.initItems) return;
		this.items.map( existItem => existItem.selected = item === existItem );
		this.changeEvent.emit(this.selectedItem);
		// console.log(this.selectedItem, this.items);
		if (this.selectedItem && this.hiddenItems && this.showHiddenSelectedItem) {
			let index: number = this.hiddenItems.indexOf(this.selectedItem);
			if (index >= 0) {
				index = this.items.indexOf(this.selectedItem);
				if (index >= 0) this.items.splice(this.maxVisibleCount - 1, 0, this.items.splice(index, 1)[0]);
				this.items.sort((a: any, b: any) => {
					let aIndex = this.initItems.indexOf(this.initItems.find( i => i.routerLink === a.routerLink));
					let bIndex = this.initItems.indexOf(this.initItems.find( i => i.routerLink === b.routerLink));
					return a.routerLink !== this.selectedItem.routerLink ? aIndex - bIndex : 0;
				});
			}else{
				this.items.sort((a: any, b: any) => {
					let aIndex = this.initItems.indexOf(this.initItems.find( i => i.routerLink === a.routerLink));
					let bIndex = this.initItems.indexOf(this.initItems.find( i => i.routerLink === b.routerLink));
					return aIndex - bIndex;
				});
			}
		}
		if (!this.changeDetector['destroyed']) this.changeDetector.detectChanges();
	}

}
