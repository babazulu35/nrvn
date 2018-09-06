import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ClaimModalComponent } from './../../common/claim-modal/claim-modal.component';
import { Component, OnInit, HostBinding, Input, EventEmitter, Output, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { ShoppingCartService } from '../../../../services/shopping-cart.service';
import { NotificationService } from '../../../../services/notification.service';
@Component({
  selector: 'app-campaign-monitor',
  templateUrl: './campaign-monitor.component.html',
  styleUrls: ['./campaign-monitor.component.scss'],
  entryComponents:[ClaimModalComponent]
})
export class CampaignMonitorComponent implements OnInit {
  @HostBinding('class.c-campaign-monitor') true;
	errors:any;
	@Input() set errorData(errors:any) {
		this.errors = errors;
	};
	isError= [];
	errorMessage:string;
  @Output() resultEvent = new EventEmitter<Object>();

  addClaimCode: ClaimModalComponent;
  campaign:any;
  @Input()  set campaignData(campaignData: Object) {
	this.campaign = campaignData;
  }

  constructor(
   private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private tetherService: TetherDialog,
    private shoppingCartService:ShoppingCartService,
    private notificationService:NotificationService
  ) { }

  ngOnInit() {
		//console.log("Has Error REsult",this.errors);		
  }

	/*
	  straightUse(index) {
	    this.isError[index] = true;
	    this.resultEvent.emit({
	      campaignId:index
	    })
	  }
	*/
  	applyCampaign(campaign){
		let applyCampaign = this.shoppingCartService.applyCampaign(campaign);
		applyCampaign.subscribe(result => {
			if(result['error']){
				this.notificationService.add({type:'warning', text:result['error']});
			}else{
				if(result && result['CurrentState'] == 6){
					this.openClaimModal(result['State']['Campaign']);
				}else{
					this.resultEvent.emit({
		      			action:"refreshState",
		      			state: result
		    		});
				}
			}
		},error => {
			if(error['ErrorCode'] == 'SM001'){
				this.shoppingCartService.goBack().subscribe(result => {
					this.applyCampaign(campaign)
				});
			}else{
				this.notificationService.add({type:'warning', text:error['Message']});
			}
		})
	}

   openClaimModal(campaign) {
    let component: ComponentRef<ClaimModalComponent> = this.resolver.resolveComponentFactory(ClaimModalComponent).create(this.injector);
    this.addClaimCode = component.instance;
    this.addClaimCode.campaign = campaign;
    this.tetherService.modal(component,{
      	escapeKeyIsActive: true,
      	dialog: {
        	style: { maxWidth: "400px", width: "80vw", height: "60vh" }
      	},
      }).then( result => {
      	if(result['action'] == 'dismiss'){
      		this.shoppingCartService.goBack().subscribe(goBackState => {
      			//this.shoppingCartService.setCurrentState(goBackState);
      		});
      	}else{
					//console.log("Resutss",result['form']);
      		let claim = this.shoppingCartService.validateClaim(result['form']);
			claim.subscribe(claimResult => {
					
					if('Campaign' in claimResult['State']) {
						if(claimResult['State']['Campaign']['ValidationResults'].length > 0 ){

								this.shoppingCartService.goBack().subscribe(goBackState => {
									//console.log("goBackResult",goBackState);
	  							
									this.resultEvent.emit({
					      				action: "error",
					      				validation: claimResult['State']['Campaign']['ValidationResults'][0]['ValidationError']
				    				});
	  					});	
							
							this.isError[this.campaign.Id] = true;
							this.errorMessage = claimResult['State']['Campaign']['ValidationResults'][0]['ValidationError'];

						}
						else if(claimResult['State']['Campaign']['AuthenticationErrorMessage'] != null) {
							//console.log("Claim Sonucu",claimResult['State']['Campaign']['AuthenticationErrorMessage']);
								this.shoppingCartService.goBack().subscribe(goBackState => {	  						
									this.resultEvent.emit({
				      				action: "emptyfield",
				      				message: claimResult['State']['Campaign']['AuthenticationErrorMessage']
			    				});
	  					});
							this.isError[this.campaign.Id] = true;
							this.errorMessage = claimResult['State']['Campaign']['AuthenticationErrorMessage'];
						}
					}
					else {
						this.resultEvent.emit({
			      				action:"refreshState",
			      				state: claimResult
		    		});
						this.isError[this.campaign.Id] = false;
						this.errorMessage = '';
					}
			});
      	}
    },error => {
		this.shoppingCartService.goBack().subscribe(goBackState => {
  			this.shoppingCartService.setCurrentState(goBackState);
  		});
    }).catch( e =>{
    	//console.log('catch',e)
    })
  }
  cancelCampaign(campaign){
  	if(campaign.IsApplied){
  		let cancelCampaign = this.shoppingCartService.cancelCampaign(campaign);
		cancelCampaign.subscribe(result => {
			if(result){
				this.resultEvent.emit({
	      			action:"refreshState",
	      			state: result
	    		});
			}
		},error => {
		});
  	}
  }

}
