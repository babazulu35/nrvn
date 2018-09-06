



import { Component, OnInit, HostBinding } from '@angular/core';
import { ShoppingCartService } from './../../../services/shopping-cart.service';
import { CollectData } from './../../../models/collect-data';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { NotificationService } from './../../../services/notification.service';
import { RefreshStateService } from './../../../services/refresh-state/refresh-state.service';

@Component({
  selector: 'app-boxoffice-collect-data',
  templateUrl: './boxoffice-collect-data.component.html',
  styleUrls: ['./boxoffice-collect-data.component.css'],
 
})
export class BoxofficeCollectDataComponent implements OnInit {
  @HostBinding('class.or-boxoffice-collect-data') true;
  public collectData;
  collectDataForm = [];
  closeDom:boolean = true;
  isValid:boolean = false;
  datasal= {}

  constructor( private shoppingCartService: ShoppingCartService,private router : Router,private notificationService: NotificationService, private refreshStateService: RefreshStateService) { 

    //this.shoppingCartService.setCustomEndpoint('GotoCollectData?includeStateModel=true',true);
  }

  ngOnInit() { 
    
    
    this.collectData = this.shoppingCartService.getCurrentState();
    console.log(this.collectData);
    this.collectDataForm = [];

  }

  ngAfterViewInit() {
    
/*     this.refreshStateService.refreshStateHandler.subscribe(result => {
        if(result)
        {
        console.log("Result on Service",result);
        
            this.collectData = result;
            
        }
        
    })    */ 
  }

  saveCollection() {
    this.shoppingCartService.setCustomEndpoint('PostMetadataValues?includeStateModel=true',true);  
    let save = this.shoppingCartService.create(this.collectDataForm);
    save.subscribe(result => {
        
        if(result && result['State']) {
            
            if(result['CurrentState']  == 7) {
                this.shoppingCartService.setCurrentState(result);
                this.router.navigate(['boxoffice','purchase']);
            }
            if(result['CurrentState'] == 4) {
                this.router.navigate(['boxoffice','basket']);
            }
            if(result['CurrentState'] == 8) {
                //this.collectData = result;
                this.refreshStateService.refreshState(result);
                
            }
        }
    },(err) => {
        console.log("Service Error",err);
        if(err['ErrorCode'] == "WRF0091" || err['ErrorCode'] == "RDS0003") {
            this.notificationService.add({ text: err['Message'], type: 'warning' });
        }
        if(err['ErrorCode'] == "RDS0010" ) {
            let parse = JSON.parse(err['Message'])
            this.notificationService.add({ text: parse.Field, type: 'warning' });
            //this.collectForm.controls[parse].updateValueAndValidity()
        }
        
    })
  }

  actionHandler(event) {
      console.log("Actin event Wathcer",event);
      if(event.action == 'refreshState') {
          this.collectData = event.data;
      }

      if(event.action == 'formData') {
          
        for(let results in event.data) {
            if(this.collectDataForm.map(result => { return result['Name'] }).indexOf(event.data[results]['Name']) == -1) {
              this.collectDataForm.push({
                "MetadataId":event.data[results].MetadataId,
                "Name": event.data[results].Name,
                "Value": event.data[results].Value
            
            });
        }
            if(this.collectDataForm[this.collectDataForm.map(result => {return result['Name']}).findIndex(result => result == event.data[results]['Name'])]['Value'] != event.data[results]['Value'])
            {
                this.collectDataForm[this.collectDataForm.map(result => {return result['Name']}).findIndex(result => result == event.data[results]['Name'])]['Value'] = event.data[results]['Value'];
            }
            if(event.data[results]['Value']  == "" || event.data[results]['Value'] == null) {
                this.collectDataForm.splice(this.collectDataForm.map(result => {return result['Name']}).findIndex(result => result == event.data[results]['Name']),1); 
            }         
          this.isValid = event.isValid;
        }

        console.log("Colect data on route",this.collectDataForm);
      }
  }

  regexControl(pattern):boolean {
    let control = new RegExp(pattern);
    return control.test(pattern);
  }
  
 

	goBack(event){
		this.shoppingCartService.goBack().subscribe(result => {
            this.shoppingCartService.setCurrentState(result);
            console.log("State Resutl On GoBAck",result);
            if(result['PreviousState'] == 2) {
                this.shoppingCartService.setCustomEndpoint('CreateShoppingSession?includeStateModel=true',true);
                let clearBasket = this.shoppingCartService.create({});
                clearBasket.subscribe(() => {
                    this.shoppingCartService.getCartSummary();
                    this.shoppingCartService.removeCartUser();
                    this.router.navigate(['boxoffice']);
                })
            }
            else
            {
                let goback = this.shoppingCartService.redirectToCorrectStateRoute();
			    this.router.navigate(goback['routerLink']);
            }
			
		})
	}	

}
