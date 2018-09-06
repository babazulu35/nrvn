import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { TypeaheadComponent } from './../../../common-module/components/typeahead/typeahead.component';
import { Component, OnInit, HostBinding, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-add-performance',
  templateUrl: './add-performance.component.html',
  styleUrls: ['./add-performance.component.scss']
})
export class AddPerformanceComponent implements OnInit {
  @ViewChild(TypeaheadComponent) typeahead: TypeaheadComponent;

  @HostBinding('class.oc-performer-create') true;

  @Input() title: string;

  constructor(public tetherService:TetherDialog) {
    this.tetherService = tetherService;
  }

  ngOnInit() {
  }

  public submit() {
    let result = {
      status: "Sended From add Performance"
    };
    this.tetherService.close(result);
  }

}
