import { v4 as uuidv4 } from 'uuid';
import { FieldSchema, FormSchema } from '../models/schema.model';

export class FormSchemaBuilder {
  private formSchema: FormSchema;

  constructor(title: string) {
    this.formSchema = {
      formId: uuidv4(),
      title,
      fields: [],
      layout: 'vertical'
    };
  }

  setDescription(description: string): this {
    this.formSchema.description = description;
    return this;
  }

  setLayout(layout: 'horizontal' | 'vertical' | 'inline'): this {
    this.formSchema.layout = layout;
    return this;
  }

  addField(field: FieldSchema): this {
    this.formSchema.fields.push(field);
    return this;
  }

  removeField(fieldId: string): this {
    this.formSchema.fields = this.formSchema.fields.filter(f => f.id !== fieldId);
    return this;
  }

  updateField(fieldId: string, updatedField: Partial<FieldSchema>): this {
    const index = this.formSchema.fields.findIndex(f => f.id === fieldId);
    if (index !== -1) {
      this.formSchema.fields[index] = { ...this.formSchema.fields[index], ...updatedField } as FieldSchema;
    }
    return this;
  }

  build(): FormSchema {
    // Return a deep copy to prevent external mutation
    return structuredClone(this.formSchema);
  }
}
