import { Injectable } from '@angular/core';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  private static parent: string;

  constructor(private router: Router, private route: ActivatedRoute) { }

  public hasParent(): boolean {
    if (NavService.parent) {
      return true;
    } else {
      return false;
    }
  }

  public setParent(): void {
    this.route.url.subscribe(() => {
      NavService.parent = this.route.snapshot.firstChild.data.parent;
    });
  }

  public goBack(): void {
    if (this.hasParent()) {
      // Hack to fix relative paths
      if (NavService.parent.includes('..')) {
        const parentUrl: Array<string> = NavService.parent.split('/');
        const newUrl: Array<string> = this.route.snapshot.firstChild.url.map(data => data.path);

        parentUrl.forEach(data => {
          if (data === '..') {
            newUrl.pop();
          } else if (data) {
            newUrl.push(data);
          }
        });

        this.router.navigate(newUrl);
      } else {
        this.router.navigate([NavService.parent]);
      }
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
