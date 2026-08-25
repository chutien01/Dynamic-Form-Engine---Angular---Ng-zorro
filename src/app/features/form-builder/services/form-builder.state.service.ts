import { Injectable, signal, computed } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { FormSchema, FieldSchema, FieldType } from '../../../core/models/schema.model';
import { FormSchemaBuilder } from '../../../core/builders/form-schema.builder';
import { FieldBuilderFactory } from '../../../core/builders/field.builder';
import { 
  findFieldById, 
  updateFieldRecursive, 
  deleteFieldRecursive, 
  addChildFieldToContainer,
  moveChildFieldInContainer,
  duplicateFieldRecursive,
  insertFieldRelativeToTargetRecursive
} from '../../../core/utils/schema.utils';

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
  readonly isConfigModalOpen = signal<boolean>(false);

  // Computed signal for the currently selected field (searches recursively)
  readonly activeField = computed(() => {
    const id = this.activeFieldId();
    if (!id) return null;
    return findFieldById(this.schema().fields, id);
  });

  // Computed list of dropzone IDs (for CDK Drag and Drop connections)
  readonly connectedDropLists = computed(() => {
    const ids = ['canvasList'];
    for (const field of this.schema().fields) {
      if (field.type === FieldType.CARD) {
        ids.push(`container_${field.id}`);
      } else if (
        (field.type === FieldType.TABS || field.type === FieldType.COLLAPSE || field.type === FieldType.STEPS) &&
        'items' in field && Array.isArray(field.items)
      ) {
        for (const item of field.items) {
          ids.push(`container_${item.id}`);
        }
      }
    }
    return ids;
  });

  setActiveField(fieldId: string | null): void {
    this.activeFieldId.set(fieldId);
  }

  openConfigModal(fieldId?: string): void {
    if (fieldId) {
      this.setActiveField(fieldId);
    }
    this.isConfigModalOpen.set(true);
  }

  closeConfigModal(): void {
    this.isConfigModalOpen.set(false);
  }

  updateActiveField(updatedData: Partial<FieldSchema>): void {
    const currentId = this.activeFieldId();
    if (currentId) {
      this.schema.update(currentSchema => ({
        ...currentSchema,
        fields: updateFieldRecursive(currentSchema.fields, currentId, updatedData)
      }));
    }
  }

  private getDefaultLabel(fieldType: FieldType): string {
    const defaultLabelMap: Partial<Record<FieldType, string>> = {
      [FieldType.TEXT_INPUT]: 'Text Input',
      [FieldType.TEXT_AREA]: 'Textarea',
      [FieldType.NUMBER]: 'Number',
      [FieldType.SELECT]: 'Select Dropdown',
      [FieldType.RADIO_GROUP]: 'Radio Group',
      [FieldType.CHECKBOX]: 'Checkbox',
      [FieldType.DATE_PICKER]: 'Date Picker',
      [FieldType.SWITCH]: 'Switch',
      [FieldType.DATE_RANGE]: 'Date Range',
      [FieldType.RATE]: 'Rating',
      [FieldType.SLIDER]: 'Slider',
      [FieldType.FILE_UPLOAD]: 'File Upload',
      [FieldType.CARD]: 'Card Section',
      [FieldType.TABS]: 'Tabs Container',
      [FieldType.COLLAPSE]: 'Accordion / Collapse',
      [FieldType.STEPS]: 'Step Wizard'
    };
    return defaultLabelMap[fieldType] || `New ${fieldType} field`;
  }

  addField(fieldType: FieldType, index: number, autoOpenModal = true): string {
    const newField = FieldBuilderFactory.create(fieldType)
      .setLabel(this.getDefaultLabel(fieldType))
      .build();

    this.schema.update(current => {
      const nextFields = [...current.fields];
      nextFields.splice(index, 0, newField);
      return { ...current, fields: nextFields };
    });

    this.setActiveField(newField.id);
    if (autoOpenModal) {
      this.openConfigModal(newField.id);
    }
    return newField.id;
  }

  addChildField(containerId: string, itemId: string | null, fieldType: FieldType, targetIndex?: number, autoOpenModal = true): string {
    const newField = FieldBuilderFactory.create(fieldType)
      .setLabel(this.getDefaultLabel(fieldType))
      .build();

    this.schema.update(current => ({
      ...current,
      fields: addChildFieldToContainer(current.fields, containerId, itemId, newField, targetIndex)
    }));

    this.setActiveField(newField.id);
    if (autoOpenModal) {
      this.openConfigModal(newField.id);
    }
    return newField.id;
  }

  moveChildField(containerId: string, itemId: string | null, previousIndex: number, currentIndex: number): void {
    this.schema.update(current => ({
      ...current,
      fields: moveChildFieldInContainer(current.fields, containerId, itemId, previousIndex, currentIndex)
    }));
  }

  duplicateField(fieldId: string): string | null {
    let newId: string | null = null;
    this.schema.update(schema => {
      const result = duplicateFieldRecursive(schema.fields, fieldId);
      newId = result.clonedId;
      return { ...schema, fields: result.updatedFields };
    });

    if (newId) {
      this.setActiveField(newId);
    }
    return newId;
  }

  deleteField(fieldId: string): void {
    if (this.activeFieldId() === fieldId) {
      this.setActiveField(null);
      this.closeConfigModal();
    }
    this.schema.update(schema => ({
      ...schema,
      fields: deleteFieldRecursive(schema.fields, fieldId)
    }));
  }

  addFieldBefore(relativeFieldId: string, fieldType: FieldType): string | null {
    const newField = FieldBuilderFactory.create(fieldType)
      .setLabel(this.getDefaultLabel(fieldType))
      .build();

    this.schema.update(schema => ({
      ...schema,
      fields: insertFieldRelativeToTargetRecursive(schema.fields, relativeFieldId, newField, 'before')
    }));

    this.setActiveField(newField.id);
    return newField.id;
  }

  addFieldAfter(relativeFieldId: string, fieldType: FieldType): string | null {
    const newField = FieldBuilderFactory.create(fieldType)
      .setLabel(this.getDefaultLabel(fieldType))
      .build();

    this.schema.update(schema => ({
      ...schema,
      fields: insertFieldRelativeToTargetRecursive(schema.fields, relativeFieldId, newField, 'after')
    }));

    this.setActiveField(newField.id);
    return newField.id;
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
    this.closeConfigModal();
  }
}
