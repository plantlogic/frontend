import { User } from 'src/app/_auth/user';

export class AuthDTO {
  expiration: string;
  token: string;
  user: User;
}
