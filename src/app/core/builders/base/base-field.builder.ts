import { v4 as uuidv4 } from 'uuid';
import {
  FieldOption,
  FieldType,
  FieldValidation,
  FieldConditions,
  BaseFieldSchema,
} from '../../models/schema.model';

export abstract class BaseFieldBuilder<T extends BaseFieldSchema> {
  protected schema: Partial<T>;

  constructor(type: FieldType) {
    const id = uuidv4();
    const shortKey = `field_${id.replace(/-/g, '').slice(0, 6)}`;
    this.schema = {
      id: id,
      key: shortKey,
      type: type,
      label: 'New Field',
      gridSpan: 24, // Mặc định full width
    } as Partial<T>;
  }

  setKey(key: string): this {
    this.schema.key = key;
    return this;
  }

  setLabel(label: string): this {
    this.schema.label = label;
    return this;
  }

  setRequired(required: boolean): this {
    this.schema.required = required;
    return this;
  }

  setDefaultValue(value: unknown): this {
    this.schema.defaultValue = value;
    return this;
  }

  setGridSpan(span: number): this {
    this.schema.gridSpan = span;
    return this;
  }

  setValidations(validations: FieldValidation): this {
    this.schema.validations = validations;
    return this;
  }

  setConditions(conditions: FieldConditions): this {
    this.schema.conditions = conditions;
    return this;
  }

  build(): T {
    return { ...this.schema } as T;
  }
}

export abstract class BaseOptionsFieldBuilder<
  T extends BaseFieldSchema & { options?: FieldOption[] },
> extends BaseFieldBuilder<T> {
  constructor(type: FieldType) {
    super(type);
    this.schema.options = [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
    ];
  }

  setOptions(options: FieldOption[]): this {
    this.schema.options = options;
    return this;
  }
}
