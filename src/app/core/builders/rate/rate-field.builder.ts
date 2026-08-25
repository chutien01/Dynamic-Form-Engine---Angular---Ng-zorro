import { FieldType } from '../../models/schema/field-type.enum';
import { RateFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class RateFieldBuilder extends BaseFieldBuilder<RateFieldSchema> {
  constructor() {
    super(FieldType.RATE);
    this.schema.count = 5;
    this.schema.allowHalf = false;
  }

  setCount(count: number): this {
    this.schema.count = count;
    return this;
  }

  setAllowHalf(allowHalf: boolean): this {
    this.schema.allowHalf = allowHalf;
    return this;
  }
}
