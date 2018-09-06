import {CollectData as RelationTypeEnum } from './collect-data.enum';
import { CollectFieldData } from './collect-field-data';

export class CollectData {
    MetadataType:number;
    MetadataType_Desc:string;
    MetadataId:number;
    MetadataTitle:string;
    MetadataNode:{
        RelationType: RelationTypeEnum;
        RelationType_Desc:string;
        Children?:{};
        Field?: CollectFieldData;
    }
}
