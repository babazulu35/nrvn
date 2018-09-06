import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { Component, OnInit, Input, HostBinding, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-field-card',
  templateUrl: './cms-field-card.component.html',
  styleUrls: ['./cms-field-card.component.scss']
})
export class CmsFieldCardComponent implements OnInit {
  @HostBinding('class.c-cms-field-card') true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();
  
  @Input() leftIcon: string = 'menu';
  @Input() isDraggable: boolean;

  @Input() set data(value: any) {
    this.fieldData = value;
    if(this.fieldData){
      this.cmsFields = this.appSettingsService.getLocalSettings('cmsFields');
      this.cmsField = this.cmsFields.find( cmsField => this.fieldData.FieldType == cmsField.FieldType );
      this.contextMenuData = [];
      this.contextMenuData.push({action: "editField", label: "Düzenle", params: {field: this.fieldData}});
      this.contextMenuData.push({action: "removeField", label: "Sil", params: {field: this.fieldData}});
    }
  };
  
  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  
  fieldData: any;
  cmsField: {
    FieldType: string,
    Icon: string,
    Label: string,
    Settings?: any[]
  }
  private cmsFields: any[];

  constructor(
    private appSettingsService: AppSettingsService,
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {
    
  }

  openContextMenu(event) {
    if(!this.contextMenuData || this.contextMenuData.length == 0) return;

    this.tetherService.context({
			title: "İŞLEMLER",
			data: this.contextMenuData
		}, {
      target: event.target
    }).then( result => this.actionEvent.emit(result)).catch( reason => {});
  }

}
