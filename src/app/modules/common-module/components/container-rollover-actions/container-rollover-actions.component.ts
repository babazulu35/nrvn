import { Component, OnInit, HostBinding} from '@angular/core';

@Component({
  selector: 'app-container-rollover-actions',
  templateUrl: './container-rollover-actions.component.html',
  styleUrls: ['./container-rollover-actions.component.scss']
})
export class ContainerRolloverActionsComponent implements OnInit {
  @HostBinding('class.c-container-rollover-actions') true;

  constructor() {}

  ngOnInit() {}
}
