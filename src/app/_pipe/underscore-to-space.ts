import { Pipe, PipeTransform } from '@angular/core';


// Replaces underscores with spaces
@Pipe({
  name: 'underscoreToSpace'
})
export class UnderscoreToSpace implements PipeTransform {
  transform(value: string): string {
    return value ? value.toString().replace(/_/g, ' ') : value;
  }
}
