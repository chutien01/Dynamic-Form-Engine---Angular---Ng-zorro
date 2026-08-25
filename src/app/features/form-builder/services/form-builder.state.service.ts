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
  // State Signals
  readonly schema = signal<FormSchema>(
    new FormSchemaBuilder('Untitled Form')
      .setDescription('Kéo thả các trường từ Toolbox vào đây để thiết kế form.')
      .build()
  );
  readonly activeFieldId = signal<string | null>(null);

  // Computed signal for the currently selected field
  readonly activeField = computed(() => {
    const id = this.activeFieldId();
    if (!id) return null;
    return this.schema().fields.find(f => f.id === id) ?? null;
  });

  setActiveField(fieldId: string | null): void {
    this.activeFieldId.set(fieldId);
  }

  updateActiveField(updatedData: Partial<FieldSchema>): void {
    const currentId = this.activeFieldId();
    if (currentId) {
      this.schema.update(currentSchema => ({
        ...currentSchema,
        fields: currentSchema.fields.map(field =>
          field.id === currentId ? ({ ...field, ...updatedData } as FieldSchema) : field
        )
      }));
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

    this.schema.update(current => {
      const nextFields = [...current.fields];
      nextFields.splice(index, 0, newField);
      return { ...current, fields: nextFields };
    });

    this.setActiveField(newField.id);
    return newField.id;
  }

  duplicateField(fieldId: string): string | null {
    const current = this.schema();
    const index = current.fields.findIndex(f => f.id === fieldId);
    if (index === -1) return null;

    const sourceField = current.fields[index];
    const clonedId = uuidv4();
    const clonedField: FieldSchema = {
      ...structuredClone(sourceField),
      id: clonedId,
      key: `${sourceField.key || sourceField.id}_copy`,
      label: `${sourceField.label} (Copy)`
    };

    this.schema.update(schema => {
      const nextFields = [...schema.fields];
      nextFields.splice(index + 1, 0, clonedField);
      return { ...schema, fields: nextFields };
    });

    this.setActiveField(clonedField.id);
    return clonedField.id;
  }

  deleteField(fieldId: string): void {
    if (this.activeFieldId() === fieldId) {
      this.setActiveField(null);
    }
    this.schema.update(schema => ({
      ...schema,
      fields: schema.fields.filter(f => f.id !== fieldId)
    }));
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

  moveField(previousIndex: number, currentIndex: number): void {
    this.schema.update(schema => {
      const nextFields = [...schema.fields];
      moveItemInArray(nextFields, previousIndex, currentIndex);
      return { ...schema, fields: nextFields };
    });
  }

  loadSchema(schema: FormSchema): void {
    this.schema.set({
      formId: schema.formId || uuidv4(),
      title: schema.title || 'Untitled Form',
      description: schema.description || '',
      layout: schema.layout || 'vertical',
      fields: Array.isArray(schema.fields) ? structuredClone(schema.fields) : []
    });
    this.setActiveField(null);
  }
}
