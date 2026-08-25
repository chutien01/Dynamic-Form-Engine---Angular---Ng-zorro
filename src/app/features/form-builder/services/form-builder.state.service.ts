import { Injectable, signal, computed } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { FormSchema, FieldSchema, FieldType } from '../../../core/models/schema.model';
import { FormSchemaBuilder } from '../../../core/builders/form-schema.builder';
import { FieldBuilderFactory } from '../../../core/builders/field.builder';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderStateService {
  private schemaBuilder = new FormSchemaBuilder('Untitled Form')
    .setDescription('Kéo thả các trường từ Toolbox vào đây để thiết kế form.');

  // State Signals
  readonly schema = signal<FormSchema>(this.schemaBuilder.build());
  readonly activeFieldId = signal<string | null>(null);

  // Computed signal for the currently selected field
  readonly activeField = computed(() => {
    const id = this.activeFieldId();
    if (id) {
      const field = this.schema().fields.find(f => f.id === id);
      return field ? { ...field } : null;
    }
    return null;
  });

  private updateSchema() {
    this.schema.set(this.schemaBuilder.build());
  }

  setActiveField(fieldId: string | null) {
    this.activeFieldId.set(fieldId);
  }

  updateActiveField(updatedData: Partial<FieldSchema>) {
    const currentId = this.activeFieldId();
    if (currentId) {
      this.schemaBuilder.updateField(currentId, updatedData);
      this.updateSchema();
    }
  }

  addField(fieldType: FieldType, index: number): string {
    const defaultLabelMap: Partial<Record<FieldType, string>> = {
      [FieldType.TEXT_INPUT]: 'TEXT_INPUT',
      [FieldType.TEXT_AREA]: 'TEXT_AREA',
      [FieldType.NUMBER]: 'NUMBER',
      [FieldType.SELECT]: 'SELECT',
      [FieldType.RADIO_GROUP]: 'RADIO_GROUP',
      [FieldType.CHECKBOX]: 'CHECKBOX',
      [FieldType.DATE_PICKER]: 'DATE_PICKER'
    };

    const newField = FieldBuilderFactory.create(fieldType)
      .setLabel(defaultLabelMap[fieldType] || `New ${fieldType} field`)
      .build();
    
    const currentFields = [...this.schema().fields];
    currentFields.splice(index, 0, newField);
    
    this.rebuildSchemaFromFields(currentFields);
    this.setActiveField(newField.id);
    return newField.id;
  }

  duplicateField(fieldId: string): string | null {
    const currentFields = [...this.schema().fields];
    const index = currentFields.findIndex(f => f.id === fieldId);
    if (index === -1) return null;

    const sourceField = currentFields[index];
    const clonedId = uuidv4();
    const clonedField: FieldSchema = {
      ...JSON.parse(JSON.stringify(sourceField)),
      id: clonedId,
      key: `${sourceField.key || sourceField.id}_copy`,
      label: `${sourceField.label} (Copy)`
    };

    currentFields.splice(index + 1, 0, clonedField);
    this.rebuildSchemaFromFields(currentFields);
    this.setActiveField(clonedField.id);
    return clonedField.id;
  }

  deleteField(fieldId: string): void {
    const currentFields = this.schema().fields.filter(f => f.id !== fieldId);
    if (this.activeFieldId() === fieldId) {
      this.setActiveField(null);
    }
    this.rebuildSchemaFromFields(currentFields);
  }

  addFieldBefore(relativeFieldId: string, fieldType: FieldType): string | null {
    const index = this.schema().fields.findIndex(f => f.id === relativeFieldId);
    if (index === -1) return null;
    return this.addField(fieldType, index);
  }

  addFieldAfter(relativeFieldId: string, fieldType: FieldType): string | null {
    const index = this.schema().fields.findIndex(f => f.id === relativeFieldId);
    if (index === -1) return null;
    return this.addField(fieldType, index + 1);
  }

  moveField(previousIndex: number, currentIndex: number) {
    const currentFields = [...this.schema().fields];
    moveItemInArray(currentFields, previousIndex, currentIndex);
    this.rebuildSchemaFromFields(currentFields);
  }

  private rebuildSchemaFromFields(fields: FieldSchema[]) {
    this.schemaBuilder = new FormSchemaBuilder(this.schema().title)
      .setDescription(this.schema().description || '')
      .setLayout(this.schema().layout || 'vertical');
      
    fields.forEach(f => this.schemaBuilder.addField(f));
    this.updateSchema();
  }

  loadSchema(schema: FormSchema) {
    this.schemaBuilder = new FormSchemaBuilder(schema.title || 'Untitled Form')
      .setDescription(schema.description || '')
      .setLayout(schema.layout || 'vertical');
      
    if (schema.fields && Array.isArray(schema.fields)) {
      schema.fields.forEach(f => this.schemaBuilder.addField(f));
    }
    
    this.updateSchema();
    this.setActiveField(null);
  }
}

