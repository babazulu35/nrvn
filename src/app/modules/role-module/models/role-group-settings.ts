
import { BaseModel } from './../../../classes/base-model';
import { RoleGroup } from './role-group'; 
import { UserGroup } from './user-group';

export class RoleGroupSettings extends BaseModel {
    
    Id:number;
    Name:string;
    Roles:any;
    Users?:any
    
}
