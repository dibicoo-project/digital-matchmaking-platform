import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fixNewLines'
})
export class FixNewLinesPipe implements PipeTransform {

  transform(value: string): string {
    return value?.replace(/\n+/g, '\n');
  }

}
