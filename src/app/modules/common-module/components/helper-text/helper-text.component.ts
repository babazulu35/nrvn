import { Component, OnInit, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-helper-text',
  templateUrl: './helper-text.component.html',
  styleUrls: ['./helper-text.component.scss']
})
export class HelperTextComponent implements OnInit {
  @HostBinding('class.c-helper-text') true;

  @HostBinding('class.c-helper-text--info') isInfo:boolean = true;
  @HostBinding('class.c-helper-text--warning') isWarning:boolean;
  @HostBinding('class.c-helper-text--danger') isDanger:boolean;
  @HostBinding('class.c-helper-text--success') isSuccess:boolean;

  @HostBinding('class.c-helper-text--dark') isDark:boolean;

  @Input() text: string;
  @Input() icon: string;

  @Input() set theme(value: string) {
    this.isDark = value == "dark";
  }
  
  @Input() set type(value: string) {
    this.isInfo = value == "info";
    this.isDanger = value == "danger";
    this.isWarning = value == "warning";
    this.isSuccess = value == "success";

    if(!this.icon) {
      switch(value) {
        case "info":
          this.icon = "info_outline";
        break;
        case "warning":
          this.icon = "warning";
        break;
        case "danger":
          this.icon = "error";
        break;
        case "success":
          this.icon = "done"
        break;
      }
    }
  }


  constructor() { }

  ngOnInit() {
  }

}
