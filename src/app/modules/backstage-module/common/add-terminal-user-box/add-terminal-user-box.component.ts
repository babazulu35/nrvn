import { User } from './../../../../models/user';
import { EntityService } from './../../../../services/entity.service';
import { Observable } from 'rxjs/Observable';
import { Terminal } from './../../../../models/terminal';
import { TerminalUser } from './../../../../models/terminal-user';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { Component, OnInit, HostBinding, HostListener, ViewChild, ChangeDetectorRef, Input } from '@angular/core';

@Component({
  selector: 'app-add-terminal-user-box',
  templateUrl: './add-terminal-user-box.component.html',
  styleUrls: ['./add-terminal-user-box.component.scss'],
  providers: [EntityService]
})
export class AddTerminalUserBoxComponent implements OnInit {
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  
  @HostBinding('class.oc-add-terminal-user-box') true;

  @HostListener('keyup.enter') enterHandler(){
    this.submitClickHandler(null);
  };

  @Input() title: string;
  @Input() isEditMode: boolean = false;
  @Input() terminalUser: TerminalUser
  @Input() set terminal(terminal: Terminal) {
    if(this.terminalUser) {
      this.terminalUser.TerminalId = terminal.Id;
      this.terminalUser.Terminal = terminal;
    }
  };
  
  @Input() set user(user: User) {
    if(this.terminalUser) {
      this.terminalUser.UserId = user.Id;
      this.terminalUser.User = user;
    }
  };

  get terminal(): Terminal { return this.terminalUser ? this.terminalUser.Terminal : null };
  get user(): User { return this.terminalUser ? this.terminalUser.User : null };

  currentLevel: { key: string, title: string, hasScroll?: boolean, historyIsActive?: boolean, params?:any };
  currentLevelIndex: number = 0;
  levels: { key: string, title: string, hasScroll?: boolean, historyIsActive?: boolean, params?:any }[];
  today = new Date();

  //@Input() userSelectPresets: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?: any}[] }[]>;
  @Input() userSelectSearchResults: Observable<{}> | Observable<{ title: string, list: {id: any, title: string, icon?: string, description?:string, params?:any}[] }[]>;

  isLoading: boolean;
  isPromising: boolean;

  public validation: {
    User: { isValid: any, message: string },
    Settings: { isValid: any, message: string }
	} = {
    User: {
      	message: "Kullanıcı seçimi zorunludur",
        isValid(): boolean {
          return this.terminalUser && this.terminalUser.User;
        }
    },
    Settings: {
      message: "Zorunlu ayarlar doldurulmalıdır",
      isValid(): boolean {
        return this.currentLevel.key == "userSettings" ? this.terminalUser && this.terminalUser.BeginDate && this.terminalUser.EndDate : true;
      }
  }
	};

	public get isValid():boolean {
		if( this.validation
      && this.validation.User.isValid.call(this)
      && this.validation.Settings.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
  };
  
  constructor(
    private userService: EntityService,
    public changeDetector: ChangeDetectorRef,
    public tetherService: TetherDialog
  ) { }

  ngOnInit() {
    this.isEditMode = this.terminalUser != null;

    this.levels = [];
    this.levels.push({key: "userSelect", title: "KULLANICI ARAYIN", hasScroll: false, historyIsActive: true, params: {}});
    this.levels.push({key: "userSettings", title: "KULLANICI AYARLARI", hasScroll: true, historyIsActive: !this.isEditMode, params: {}});

    if(this.isEditMode) {
      if(!this.title) this.title = "Terminal Kullanıcısı Ayarları";
    }else{
      if(!this.title) this.title = "Terminal Kullanıcısı Ekle";
      this.terminalUser = <TerminalUser>{
        User: null,
        BeginDate: null,
        EndDate: null,
        IsActive: true
      }

      this.userService.setCustomEndpoint("GetAll");
			this.userService.data.subscribe( users => {
				if(users) {
					let result:{}[] = [];
						users.forEach(user => {
							result.push({
								id: user["Id"], 
								title: user["FirstName"] + " " + user["LastName"], 
								icon: "person",
								disabled: user["TerminalId"] != null,
								params: {user: user}
							})
						});

						this.userSelectSearchResults = Observable.of([{
							title: "ARAMA SONUÇLARI",
							list: result
            }]);
            this.isPromising = false;
				}
			});
    }
    this.gotoLevel(this.isEditMode ? 1 : 0);
    this.changeDetector.detectChanges();
  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
  }

  levelHandler(event) {
    if(event.nextLevel == true) {
      this.nextLevel();   
    }
  }
  
  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
    if(this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {
    }
  }
  
  gotoLevel(key: any) {
    let self = this;
    if(Number.isInteger(key)) {
      this.currentLevelIndex = key;
    }else{
      this.levels.forEach(function(item, index){
        if(item.key == key) {
          self.currentLevelIndex = index;
          return;
        }
      });
    }
    let targetLevel = this.levels[this.currentLevelIndex];
    if(targetLevel != this.currentLevel) {
      this.currentLevel = targetLevel;
    }

    switch(this.currentLevel.key) {
      case "userSelect":
      this.currentLevel.params.helperText = null;
      break;
      case "userSettings":
        if(this.user) this.currentLevel.params.helperText = `<b>${this.user.FirstName} ${this.user.LastName}</b> kullanıcısının ayarlarını yapıyorsunuz.`
        
      break;
    }
    setTimeout(function() {
      
    }, 150);

    this.tetherService.position();
    this.changeDetector.detectChanges();
  }

  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":
        this.previousLevel();
      break;
    }
  }

  inputChangeHandler(event:any, name:string, target?:any) {
    switch(name){
      default: 
        target ? target[name] = event : this.terminalUser[name] = event;
      break;
    }
  }

  userSelectActionHandler(event) {
    // switch(event.action) {
      
    // }
  }

  userSelectSearchHandler(event) {
    this.isPromising = true;
    this.userService
      .fromEntity('SUser')
      .search('FirstName', event)
			.take(100)
      .page(0)
      .executeQuery();
  }

  userSelectResultHandler(event) {
    this.user = event.params.user;
  }

  userSelectDismissHandler(event) {

  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    if(this.isValid){
	    switch(this.currentLevel.key) {
	      case "userSelect":
          this.nextLevel();
	      break;
        case "userSettings":
          this.tetherService.close({terminalUser: this.terminalUser});
        break;
	      default:
	      	this.nextLevel();
	      break;
	    }
    }
  }

}
