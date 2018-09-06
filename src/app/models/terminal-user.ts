import { Terminal } from './terminal';
import { User } from './user';
import { BaseModel } from '../classes/base-model';

export class TerminalUser extends BaseModel {
    UserId?: number;
    TerminalId?: number;
    IsActive?: boolean;
    BeginDate?: Date;
    EndDate?: Date;
    User?: User;
    Terminal?: Terminal;
}