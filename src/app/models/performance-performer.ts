import {BaseModel} from '../classes/base-model';
import { Performer } from './performer';

export class PerformancePerformer extends BaseModel {
    PerformanceId: number;
    PerformerId: number;
    BeginDate?: Date;
    EndDate?: Date;
    Info?: string;
    Id?: number;
    Performer?: Performer
}
