import { PlRole } from './pl-role.enum';

export class User {
  email: string;
  username: string;
  realName: string;
  passwordUpdated: string;
  permissions: PlRole[];

  // For sending
  infoConstruct(email: string, username: string, realName: string, permissions: PlRole[]): User {
    this.email = email;
    this.username = username;
    this.realName = realName;
    this.permissions = permissions;

    return this;
  }

  // For transfer of just the user's username
  usernameConstruct(username: string): User {
    this.username = username;

    return this;
  }
}

export const fields = ['Username', 'Name', 'Email', 'Password Last Updated', 'Permissions'];
