import { BaseModel } from './../classes/base-model';

export class Terminal extends BaseModel {
    Id: number;
    Name: string;
    ShortName: string;
    IpAddress: string;
    MacAddress: string;
    Feature: string;
    Isactive: boolean;
    Address: string;
    Phone: string;
}