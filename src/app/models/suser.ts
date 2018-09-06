import { BaseModel } from '../classes/base-model';

export class SUser extends BaseModel {
    Email: string;
    FirmId: number;
    FirstName: string;
    Groups: string[];
    Id: number;
    Images: string;
    LastName: string;
    PhoneNumber: string;
    Roles: string[];
    UserName: string;
    Password: string;
    PromoterList: number[];
}
