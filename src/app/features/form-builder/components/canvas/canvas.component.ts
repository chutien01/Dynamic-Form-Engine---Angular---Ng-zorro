import { Component, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormControl, FormGroup } from '@angular/forms';
import { NgComponentOutlet } from '@angular/common';
import { FormBuilderStateService } from '../../services/form-builder.state.service';
import { FieldConditions, FieldSchema, FieldType } from '../../../../core/models/schema.model';
import { extractAllLeafFields } from '../../../../core/utils/schema.utils';
import { FieldRegistryService } from '../../../../shared/dynamic-form/services/field-registry.service';

export interface FieldTypeItem {
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-canvas',
  imports: [
    NgComponentOutlet,
    DragDropModule, 
    NzGridModule,
    NzButtonModule,
    NzDropDownModule,
    NzTooltipModule,
    NzPopconfirmModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './canvas.component.html'
})
export class CanvasComponent {
  readonly state = inject(FormBuilderStateService);
  readonly registry = inject(FieldRegistryService);
  readonly messageService = inject(NzMessageService);
  
  readonly isDragging = signal(false);
  readonly dummyFormGroup = new FormGroup({});

  readonly allFieldTypes: readonly FieldTypeItem[] = [
    { type: FieldType.CARD, label: 'Card Section', icon: '💳' },
    { type: FieldType.TABS, label: 'Tabs Container', icon: '🗂️' },
    { type: FieldType.COLLAPSE, label: 'Accordion / Collapse', icon: '🪗' },
    { type: FieldType.STEPS, label: 'Step Wizard', icon: '🪜' },
    { type: FieldType.TEXT_INPUT, label: 'Text Input', icon: '📝' },
    { type: FieldType.TEXT_AREA, label: 'Textarea', icon: '📄' },
    { type: FieldType.NUMBER, label: 'Number', icon: '🔢' },
    { type: FieldType.SELECT, label: 'Select Dropdown', icon: '🔽' },
    { type: FieldType.RADIO_GROUP, label: 'Radio Group', icon: '🔘' },
    { type: FieldType.CHECKBOX, label: 'Checkbox', icon: '☑️' },
    { type: FieldType.SWITCH, label: 'Switch', icon: '🔲' },
    { type: FieldType.DATE_PICKER, label: 'Date Picker', icon: '📅' },
    { type: FieldType.DATE_RANGE, label: 'Date Range', icon: '📆' },
    { type: FieldType.RATE, label: 'Rating (Star)', icon: '⭐' },
    { type: FieldType.SLIDER, label: 'Slider', icon: '🎚️' },
    { type: FieldType.FILE_UPLOAD, label: 'File Upload', icon: '📁' }
  ];

  constructor() {
    effect(() => {
      const fields = this.state.schema().fields;
      const leafFields = extractAllLeafFields(fields);
      const currentKeys = new Set(leafFields.map(f => f.key || f.id));

      // Remove controls that no longer exist
      Object.keys(this.dummyFormGroup.controls).forEach(key => {
        if (!currentKeys.has(key)) {
          this.dummyFormGroup.removeControl(key, { emitEvent: false });
        }
      });

      // Add missing controls
      leafFields.forEach(field => {
        const controlKey = field.key || field.id;
        if (!this.dummyFormGroup.contains(controlKey)) {
          this.dummyFormGroup.addControl(
            controlKey,
            new FormControl({ value: field.defaultValue ?? '', disabled: true }),
            { emitEvent: false }
          );
        }
      });
    });
  }

  onDrop(event: CdkDragDrop<FieldSchema[], unknown, FieldType>): void {
    this.isDragging.set(false);
    if (event.previousContainer === event.container) {
      this.state.moveField(event.previousIndex, event.currentIndex);
    } else {
      const fieldType = event.item.data as FieldType;
      if (fieldType) {
        this.state.addField(fieldType, event.currentIndex, true);
      }
    }
  }

  onFieldClick(event: MouseEvent, fieldId: string): void {
    event.stopPropagation();
    this.state.openConfigModal(fieldId);
  }

  onCanvasClick(): void {
    this.state.setActiveField(null);
  }

  openSettings(fieldId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.state.openConfigModal(fieldId);
  }

  duplicate(fieldId: string, event: MouseEvent): void {
    event.stopPropagation();
    const newId = this.state.duplicateField(fieldId);
    if (newId) {
      this.messageService.success('Đã nhân bản trường');
    }
  }

  delete(fieldId: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.state.deleteField(fieldId);
    this.messageService.success('Đã xóa trường');
  }

  addBefore(fieldId: string, type: FieldType, event: MouseEvent): void {
    event.stopPropagation();
    this.state.addFieldBefore(fieldId, type);
    this.messageService.success('Đã thêm trường phía trước');
  }

  addAfter(fieldId: string, type: FieldType, event: MouseEvent): void {
    event.stopPropagation();
    this.state.addFieldAfter(fieldId, type);
    this.messageService.success('Đã thêm trường phía sau');
  }

  getConditionSummary(conditions: FieldConditions | undefined): string {
    if (!conditions || !conditions.rules?.length) return '';
    return conditions.rules
      .map(r => `${r.fieldKey} ${r.operator} ${r.value ?? ''}`)
      .join(conditions.matchType === 'any' ? ' OR ' : ' AND ');
  }
}
