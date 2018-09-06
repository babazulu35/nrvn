import { CollectFieldData as CollectFieldTypeEnum } from './collect-field-data.enum';

export class CollectFieldData {
    Name:string;
    Value:any;
    Title:string;
    Info:any;
    Seat:string;
    Regex:any;
    TitleLocalization:any;
    InfoLocalization:any;
    IsOptional:boolean;
    OrderNo:number;
    Source: any;
    FieldType: CollectFieldTypeEnum;
    FieldType_Desc:string;
    SourceType:number;
    SourceType_Desc:string;
    SourceId: number;
}
