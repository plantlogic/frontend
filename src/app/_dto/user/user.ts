import { PlRole } from './pl-role.enum';

export class User {
  email: string;
  username: string;
  realName: string;
  password: string;
  passwordUpdated: string;
  permissions: PlRole[];
  passwordReset: boolean;
  initialUsername: string;

  // For sending
  emailConstruct(email: string, username: string, realName: string, permissions: PlRole[]): User {
    this.email = email;
    this.username = username;
    this.realName = realName;
    this.permissions = permissions;

    return this;
  }

  passConstruct(password: string, username: string, realName: string, permissions: PlRole[]): User {
    this.password = password;
    this.username = username;
    this.realName = realName;
    this.permissions = permissions;

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
    this.permissions = user.permissions;
    this.passwordReset = user.passwordReset;
  }
}
