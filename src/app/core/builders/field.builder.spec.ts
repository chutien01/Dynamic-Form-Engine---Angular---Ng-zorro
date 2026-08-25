import { describe, it, expect } from 'vitest';
import { FieldType } from '../models/schema/field-type.enum';
import { FieldBuilderFactory, TextFieldBuilder, NumberFieldBuilder } from './field.builder';

describe('FieldBuilderFactory and Builders', () => {
  it('should generate a valid UUID and correct type on initialization', () => {
    const builder = FieldBuilderFactory.create(FieldType.TEXT_INPUT) as TextFieldBuilder;
    const schema = builder.build();
    
    expect(schema.id).toBeDefined();
    expect(typeof schema.id).toBe('string');
    expect(schema.id.length).toBeGreaterThan(0);
    expect(schema.key).toBeDefined();
    expect(schema.type).toBe(FieldType.TEXT_INPUT);
    expect(schema.label).toBe('New Field');
  });

  it('should correctly set label, key, placeholder, and required', () => {
    const schema = (FieldBuilderFactory.create(FieldType.NUMBER) as NumberFieldBuilder)
      .setKey('user_age')
      .setLabel('Age')
      .setPlaceholder('Enter your age')
      .setRequired(true)
      .build();

    expect(schema.key).toBe('user_age');
    expect(schema.label).toBe('Age');
    expect(schema.placeholder).toBe('Enter your age');
    expect(schema.required).toBe(true);
  });

  it('should return a new object reference on build', () => {
    const builder = FieldBuilderFactory.create(FieldType.TEXT_INPUT);
    const schema1 = builder.build();
    const schema2 = builder.build();
    
    expect(schema1).not.toBe(schema2);
    expect(schema1).toEqual(schema2);
  });
});
