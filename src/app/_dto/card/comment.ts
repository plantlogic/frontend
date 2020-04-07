export class Comment {
    dateCreated: number = Date.now();
    dateModified: number = Date.now();
    // The name real name of the poster
    author: string;
    // The userName of the poster
    userName: string;
    // The Comment body
    body: string;
  }
