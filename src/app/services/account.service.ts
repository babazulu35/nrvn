import { BaseDataService } from "../classes/base-data-service";
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { StoreService } from "./store.service";
import { AuthenticationService } from "./authentication.service";
import { SUser } from "../models/suser";

@Injectable()
export class AccountService extends BaseDataService {
    constructor(http: Http, storeService: StoreService, authenticationService: AuthenticationService) {
        super(http, 'Account', storeService, authenticationService);
    }

    updateUser(user: SUser) {

        let payload = {
            'Id': user.Id,
            'FirstName': user.FirstName,
            'LastName': user.LastName,
            'Info': '',
            'Email': user.Email,
            'PhoneNumber': user.PhoneNumber,
            'TwoFactorEnabled': false,
            'TokenExpireSeconds': 0,
            'UserName': user.UserName,
            'Images': user.Images || '',
          };
        this.setCustomEndpoint('UpdateUser');
        return this.executePut(payload, 0);
    }

    addRoleToUser(userName: string, roleName: string) {
        this.setCustomEndpoint('AddRoleToUser');
        return this.executePost({UserName: userName, RoleName: roleName});
    }

    removeRoleFromUser(userName: string, roleName: string) {
        this.setCustomEndpoint('RemoveRoleFromUser');
        return this.executePost({UserName: userName, RoleName: roleName});
    }

    addUserToGroup(userName: string, groupName: string) {
        this.setCustomEndpoint('AddUserToGroup');
        return this.executePost({UserName: userName, GroupName: groupName});
    }

    removeUserFromGroup(userName: string, groupName: string) {
        this.setCustomEndpoint('RemoveUserFromGroup');
        return this.executePost({UserName: userName, GroupName: groupName});
    }

    registerUser(user: SUser) {
        this.setCustomEndpoint('RegisterUser');
        return this.executePost(user);
    }
}