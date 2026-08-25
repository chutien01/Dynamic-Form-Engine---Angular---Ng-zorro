import { describe, it, expect } from 'vitest';
import { FormSchemaBuilder } from './form-schema.builder';
import { FieldBuilderFactory } from './field.builder';
import { FieldType } from '../models/schema/field-type.enum';

describe('FormSchemaBuilder', () => {
  it('should generate a valid formId and default layout', () => {
    const builder = new FormSchemaBuilder('User Profile');
    const schema = builder.build();

    expect(schema.formId).toBeDefined();
    expect(schema.title).toBe('User Profile');
    expect(schema.layout).toBe('vertical');
    expect(schema.fields.length).toBe(0);
  });

  it('should correctly add and remove fields', () => {
    const field1 = FieldBuilderFactory.create(FieldType.TEXT_INPUT).setLabel('First Name').build();
    const field2 = FieldBuilderFactory.create(FieldType.TEXT_INPUT).setLabel('Last Name').build();

    const builder = new FormSchemaBuilder('Test Form')
      .addField(field1)
      .addField(field2);

    let schema = builder.build();
    expect(schema.fields.length).toBe(2);

    builder.removeField(field1.id);
    schema = builder.build();
    expect(schema.fields.length).toBe(1);
    expect(schema.fields[0].label).toBe('Last Name');
  });

  it('should update an existing field', () => {
    const field = FieldBuilderFactory.create(FieldType.NUMBER).setLabel('Age').build();
    const builder = new FormSchemaBuilder('Test Form').addField(field);

    builder.updateField(field.id, { label: 'Updated Age', required: true });
    
    const schema = builder.build();
    expect(schema.fields[0].label).toBe('Updated Age');
    expect(schema.fields[0].required).toBe(true);
  });
});
