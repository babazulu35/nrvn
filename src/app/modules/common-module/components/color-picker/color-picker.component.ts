import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotificationService } from '../../../../services/notification.service';


@Component({
	selector: 'app-color-picker',
	templateUrl: './color-picker.component.html',
	styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {

	selected = null;
	@Output() selectEvent: EventEmitter<any> = new EventEmitter();
	@Input() nullable: boolean = false;

	@Input() colors = [
		{name: '', color: 'b3d9ff', isDisabled: false, iconTheme: 'dark'},
		{name: '', color: '00ffff', isDisabled: false, iconTheme: 'dark'},
		{name: '', color: '99ff33', isDisabled: false, iconTheme: 'dark'},
		{name: '', color: 'f3f32e', isDisabled: false, iconTheme: 'dark'},
		{name: '', color: 'ffcc66', isDisabled: false, iconTheme: 'dark'},
		{name: '', color: 'ff99ff', isDisabled: false, iconTheme: ''},
		{name: '', color: '0099ff', isDisabled: false, iconTheme: ''},
		{name: '', color: '00cccc', isDisabled: false, iconTheme: ''},
		{name: '', color: '43a104', isDisabled: false, iconTheme: ''},
		{name: '', color: 'd3b800', isDisabled: false, iconTheme: ''},
		{name: '', color: 'ff6600', isDisabled: false, iconTheme: ''},
		{name: '', color: 'ff00cc', isDisabled: false, iconTheme: ''},
		{name: '', color: '0066cc', isDisabled: false, iconTheme: ''},
		{name: '', color: '038383', isDisabled: false, iconTheme: ''},
		{name: '', color: '336633', isDisabled: false, iconTheme: ''},
		{name: '', color: 'a27927', isDisabled: false, iconTheme: ''},
		{name: '', color: 'cc3300', isDisabled: false, iconTheme: ''},
		{name: '', color: '993366', isDisabled: false, iconTheme: ''},
		{name: '', color: 'cc99ff', isDisabled: false, iconTheme: ''},
		{name: '', color: 'cc33ff', isDisabled: false, iconTheme: ''},
		{name: '', color: '9900cc', isDisabled: false, iconTheme: ''}
	];

	@Input() set disabledColors(colors: string[]) {
		this.colors.forEach(color => {
			if(colors.indexOf(color.color)> -1){
				color.isDisabled = true;
			}
		});
	}

	@Input() set selectedColor(value: string) {
		if(value){
			let currentColor = this.selected;

			this.selected = null;
			this.colors.forEach(color => {
				if(color.color == value){
					if(color.isDisabled){
						this.notificationService.add({text:'Bu renk seçilemez.', type:'danger'});
					} else {
						this.selected = color;
					}
				}
			});
			if(currentColor && !this.selected) {
				this.selected = currentColor;
				this.notificationService.add({text:'Bu renk seçilemez.', type:'danger'});
			}
		} else {
			this.selected = null;
		}
	}

	constructor(
		private notificationService: NotificationService
	) {}

	ngOnInit() {
	}

	getIconColor(item){
		if(item.isDisabled) {
			return `#${item['color']}`;
		}
	}

	emitSelectEvent(e, value) {
		if(!this.selected || this.selected['color'] != value['color']) {
			this.selected = value;
			this.selectEvent.emit(value);
		} else if (this.nullable) {
			this.selected = null;
			this.selectEvent.emit(null);
		}
	}

}
