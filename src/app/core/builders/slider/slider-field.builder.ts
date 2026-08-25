import { FieldType } from '../../models/schema/field-type.enum';
import { SliderFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class SliderFieldBuilder extends BaseFieldBuilder<SliderFieldSchema> {
  constructor() {
    super(FieldType.SLIDER);
    this.schema.min = 0;
    this.schema.max = 100;
    this.schema.step = 1;
  }

  setRange(min: number, max: number, step = 1): this {
    this.schema.min = min;
    this.schema.max = max;
    this.schema.step = step;
    return this;
  }
}
