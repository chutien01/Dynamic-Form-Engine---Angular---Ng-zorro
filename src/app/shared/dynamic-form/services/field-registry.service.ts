import { Injectable, Type } from '@angular/core';
import { FieldType } from '../../../core/models/schema.model';

import { TextFieldComponent } from '../fields/text/text-field.component';
import { TextareaFieldComponent } from '../fields/textarea/textarea-field.component';
import { NumberFieldComponent } from '../fields/number/number-field.component';
import { SelectFieldComponent } from '../fields/select/select-field.component';
import { RadioFieldComponent } from '../fields/radio/radio-field.component';
import { CheckboxFieldComponent } from '../fields/checkbox/checkbox-field.component';
import { DateFieldComponent } from '../fields/date/date-field.component';

@Injectable({
  providedIn: 'root'
})
export class FieldRegistryService {
  private registry = new Map<FieldType, Type<any>>();

  constructor() {
    this.register(FieldType.TEXT_INPUT, TextFieldComponent);
    this.register(FieldType.TEXT_AREA, TextareaFieldComponent);
    this.register(FieldType.NUMBER, NumberFieldComponent);
    this.register(FieldType.SELECT, SelectFieldComponent);
    this.register(FieldType.RADIO_GROUP, RadioFieldComponent);
    this.register(FieldType.CHECKBOX, CheckboxFieldComponent);
    this.register(FieldType.DATE_PICKER, DateFieldComponent);
  }

  register(type: FieldType, component: Type<any>) {
    this.registry.set(type, component);
  }

  getComponent(type: FieldType | string): Type<any> {
    let comp = this.registry.get(type as FieldType);
    if (!comp) {
      // Fallback for legacy lowercase or aliases
      const aliasMap: Record<string, FieldType> = {
        'text': FieldType.TEXT_INPUT,
        'textarea': FieldType.TEXT_AREA,
        'number': FieldType.NUMBER,
        'select': FieldType.SELECT,
        'radio': FieldType.RADIO_GROUP,
        'checkbox': FieldType.CHECKBOX,
        'date': FieldType.DATE_PICKER
      };
      const resolved = aliasMap[type as string];
      if (resolved) {
        comp = this.registry.get(resolved);
      }
    }
    if (!comp) {
      throw new Error(`Component not found for field type: ${type}`);
    }
    return comp;
  }
}
