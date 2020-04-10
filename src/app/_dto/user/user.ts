import {PlRole} from './pl-role.enum';

export class User {
  email: string;
  initialUsername: string;
  password: string;
  passwordReset: boolean;
  passwordUpdated: string;
  permissions: PlRole[] = [];
  ranchAccess: string[];
  realName: string;
  shipperID: string;
  username: string;

  // For sending
  emailConstruct(email: string, username: string, realName: string, ranchAccess: string[],
                 permissions: PlRole[], shipperID?: string): User {
    this.email = email;
    this.username = username;
    this.realName = realName;
    this.ranchAccess = ranchAccess;
    this.permissions = permissions;
    this.shipperID = (shipperID) ? shipperID : '';
    return this;
  }

  passConstruct(password: string, username: string, realName: string, ranchAccess: string[],
                permissions: PlRole[],  shipperID?: string): User {
    this.password = password;
    this.username = username;
    this.realName = realName;
    this.ranchAccess = ranchAccess;
    this.permissions = permissions;
    this.shipperID = (shipperID) ? shipperID : '';
    return this;
  }

  editConstruct(initialUsername: string): User {
    this.initialUsername = initialUsername;
    return this;
  }

  // For transfer of just the user's username
  usernameConstruct(username: string): User {
    this.username = username;
    return this;
  }

  importInfo(user: User): void {
    this.email = user.email;
    this.username = user.username;
    this.realName = user.realName;
    this.ranchAccess = user.ranchAccess;
    this.permissions = user.permissions;
    this.passwordReset = user.passwordReset;
    this.shipperID = user.shipperID;
  }
}
