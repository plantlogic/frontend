export class BasicDTO<E> {
  success: boolean;
  data: E;
  error: string;

  constructor(success: boolean, data?: E, error?: string) {
    this.success = success;
    this.data = data;
    this.error = error;
  }
}
