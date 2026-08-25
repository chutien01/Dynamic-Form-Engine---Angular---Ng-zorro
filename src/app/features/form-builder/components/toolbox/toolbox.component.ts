import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FieldType } from '../../../../core/models/schema/field-type.enum';
import { FormBuilderStateService } from '../../services/form-builder.state.service';

export interface ToolboxItem {
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-toolbox',
  imports: [DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbox.component.html'
})
export class ToolboxComponent {
  readonly state = inject(FormBuilderStateService);

  readonly containerItems: readonly ToolboxItem[] = [
    { type: FieldType.CARD, label: 'Card Section', icon: '💳' },
    { type: FieldType.TABS, label: 'Tabs Container', icon: '🗂️' },
    { type: FieldType.COLLAPSE, label: 'Accordion / Collapse', icon: '🪗' },
    { type: FieldType.STEPS, label: 'Step Wizard', icon: '🪜' }
  ];

  readonly fieldItems: readonly ToolboxItem[] = [
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
}
