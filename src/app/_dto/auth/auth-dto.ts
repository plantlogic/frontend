import { User } from 'src/app/_dto/user/user';

export class AuthDTO {
  expiration: string;
  token: string;
  user: User;
}
