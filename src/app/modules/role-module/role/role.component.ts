import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { MainLoaderService } from '../../../services/main-loader.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  providers:[MainLoaderService]
})
export class RoleComponent implements OnInit {
  isLoading:boolean;
  constructor(private mainLoaderService:MainLoaderService,private roleChange: ChangeDetectorRef) { }

  ngOnInit() {
    this.mainLoaderService.updateLoading(true);
    this.mainLoaderService.loadingHandler.subscribe(loadingResult => {
        this.isLoading = loadingResult.isloading;
        this.roleChange.detectChanges();
        
    });
    
    
  }

}
