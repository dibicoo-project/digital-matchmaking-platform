import { Component } from "@angular/core";
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export function MockComponent(options: Component): Component {
  class Mock { }
  return Component(options)(Mock as any)
}

export function MockComponentWithValueAccessor(options: Component): Component {
  options.providers = options.providers || [];
  options.providers.push(
    {
      provide: NG_VALUE_ACCESSOR,
      useValue: {
        writeValue: () => { },
        registerOnChange: () => { },
        registerOnTouched: () => { }
      },
      multi: true
    }
  );

  return MockComponent(options);
}
