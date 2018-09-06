import { BaseModel } from '../classes/base-model';

export class AccessIntegrationType extends BaseModel{
	Name: string;
    Description: string;
    Type: number;
    Host: string;
    UserName: string;
    Password: string;
    Id: number;
}
