import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { Router } from '@angular/router';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { CmsField } from './../../../../models/cms-field';
import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-component-container-card',
  templateUrl: './cms-component-container-card.component.html',
  styleUrls: ['./cms-component-container-card.component.scss']
})
export class CmsComponentContainerCardComponent implements OnInit {
  @HostBinding('class.c-cms-component-container-card') true;

  @HostBinding('class.c-cms-component-container-card--tag') viewModeIsTag: boolean;
  @HostBinding('class.c-cms-component-container-card--bar') viewModeIsBar: boolean;

  @HostBinding('class.c-cms-component-container-card--disabled') @Input() isDisabled:boolean;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();
  
  @Input() componentContainer: {
    Name: string,
    Description: string,
    _id: string,
    Components: {
      AllowMultiple: boolean,
      Name: string,
      UniqueName: string,
      Fields: {
        FieldType: string,
        Name: string,
        UniqueName: string
      }[]
    }[]
  }

  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() set viewMode(value: string) {
    this.viewModeIsBar = value == "bar";
    this.viewModeIsTag = value == "tag";
    this.viewType = value;
  }

  viewType: string;

  fields: {
    title: string,
    icon: string
  }[];

  
  

  constructor(
    private appSettingsService: AppSettingsService,
    private router: Router,
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {
    if(this.componentContainer) {
      this.fields = [];
      let fieldsDic: {} = {};
      let cmsField: CmsField;
      if(this.componentContainer.Components) this.componentContainer.Components.forEach( component => {
        if(component.Fields) component.Fields.forEach( field => {
          if(!fieldsDic[field.FieldType]){
            cmsField = this.getField(field.FieldType);
            if(cmsField) {
              fieldsDic[field.FieldType] = field;
              if(this.fields.length < 5) {
                this.fields.push({
                  title: field.Name,
                  icon: cmsField.Icon
                });
              }
            }
          }
        });
      });
      if(this.fields && this.fields.length < 5) {
        while(this.fields.length < 5) {
          this.fields.push({title: null, icon: null});
        }
      }
    }

    if(!this.contextMenuData) {
      this.contextMenuData = [];
      this.contextMenuData.push({action: "editComponentContainer", label: "Düzenle", params: {componentContainer: this.componentContainer}});
      this.contextMenuData.push({action: "removeComponentContainer", label: "Sil", params: {componentContainer: this.componentContainer}});
    }
  }

  gotoEdit() {
    this.router.navigate(['cms', 'component-container', this.componentContainer._id, 'edit']);
  }

  private getField(fieldType: string):CmsField {
    let cmsField: CmsField;
    let cmsFields: CmsField[] = this.appSettingsService.getLocalSettings('cmsFields');
    if(cmsFields) cmsField = cmsFields.find(item => item.FieldType == fieldType);
    return cmsField;
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
