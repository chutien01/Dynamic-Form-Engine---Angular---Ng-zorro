import { Injectable, Type } from '@angular/core';
import { FieldType } from '../../../core/models/schema.model';

import { TextFieldComponent } from '../fields/text/text-field.component';
import { TextareaFieldComponent } from '../fields/textarea/textarea-field.component';
import { NumberFieldComponent } from '../fields/number/number-field.component';
import { SelectFieldComponent } from '../fields/select/select-field.component';
import { RadioFieldComponent } from '../fields/radio/radio-field.component';
import { CheckboxFieldComponent } from '../fields/checkbox/checkbox-field.component';
import { DateFieldComponent } from '../fields/date/date-field.component';
import { SwitchFieldComponent } from '../fields/switch/switch-field.component';
import { DateRangeFieldComponent } from '../fields/date-range/date-range-field.component';
import { RateFieldComponent } from '../fields/rate/rate-field.component';
import { SliderFieldComponent } from '../fields/slider/slider-field.component';
import { FileUploadFieldComponent } from '../fields/file-upload/file-upload-field.component';
import { CardFieldComponent } from '../fields/containers/card/card-field.component';
import { TabsFieldComponent } from '../fields/containers/tabs/tabs-field.component';
import { CollapseFieldComponent } from '../fields/containers/collapse/collapse-field.component';
import { StepsFieldComponent } from '../fields/containers/steps/steps-field.component';

@Injectable({
  providedIn: 'root'
})
export class FieldRegistryService {
  private readonly registry = new Map<FieldType, Type<unknown>>();

  constructor() {
    this.register(FieldType.TEXT_INPUT, TextFieldComponent);
    this.register(FieldType.TEXT_AREA, TextareaFieldComponent);
    this.register(FieldType.NUMBER, NumberFieldComponent);
    this.register(FieldType.SELECT, SelectFieldComponent);
    this.register(FieldType.RADIO_GROUP, RadioFieldComponent);
    this.register(FieldType.CHECKBOX, CheckboxFieldComponent);
    this.register(FieldType.DATE_PICKER, DateFieldComponent);
    this.register(FieldType.SWITCH, SwitchFieldComponent);
    this.register(FieldType.DATE_RANGE, DateRangeFieldComponent);
    this.register(FieldType.RATE, RateFieldComponent);
    this.register(FieldType.SLIDER, SliderFieldComponent);
    this.register(FieldType.FILE_UPLOAD, FileUploadFieldComponent);

    // Layout Containers
    this.register(FieldType.CARD, CardFieldComponent);
    this.register(FieldType.TABS, TabsFieldComponent);
    this.register(FieldType.COLLAPSE, CollapseFieldComponent);
    this.register(FieldType.STEPS, StepsFieldComponent);
  }

  register(type: FieldType, component: Type<unknown>): void {
    this.registry.set(type, component);
  }

  getComponent(type: FieldType | string): Type<unknown> {
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
        'date': FieldType.DATE_PICKER,
        'switch': FieldType.SWITCH,
        'date_range': FieldType.DATE_RANGE,
        'rate': FieldType.RATE,
        'slider': FieldType.SLIDER,
        'file_upload': FieldType.FILE_UPLOAD,
        'card': FieldType.CARD,
        'tabs': FieldType.TABS,
        'collapse': FieldType.COLLAPSE,
        'steps': FieldType.STEPS
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
