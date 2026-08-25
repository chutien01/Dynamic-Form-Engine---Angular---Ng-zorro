import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FieldType } from '../../../../core/models/schema/field-type.enum';

interface ToolboxItem {
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-toolbox',
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="p-4 bg-white border-r border-gray-200 h-full overflow-y-auto shadow-sm">
      <h3 class="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Toolbox</h3>
      <div 
        class="flex flex-col gap-3"
        cdkDropList 
        [cdkDropListConnectedTo]="['canvasList']"
        cdkDropListSortingDisabled
      >
        @for (item of items; track item.type) {
          <div 
            class="p-3 border rounded shadow-sm bg-white cursor-move hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center gap-2"
            cdkDrag 
            [cdkDragData]="item.type"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="font-medium">{{ item.label }}</span>
            <div *cdkDragPreview class="p-3 border rounded shadow-lg bg-blue-50 opacity-90 w-48 flex items-center gap-2">
              <span class="text-xl">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToolboxComponent {
  items: ToolboxItem[] = [
    { type: FieldType.TEXT_INPUT, label: 'TEXT_INPUT', icon: '📝' },
    { type: FieldType.TEXT_AREA, label: 'TEXT_AREA', icon: '📄' },
    { type: FieldType.NUMBER, label: 'NUMBER', icon: '🔢' },
    { type: FieldType.SELECT, label: 'SELECT', icon: '🔽' },
    { type: FieldType.RADIO_GROUP, label: 'RADIO_GROUP', icon: '🔘' },
    { type: FieldType.CHECKBOX, label: 'CHECKBOX', icon: '☑️' },
    { type: FieldType.DATE_PICKER, label: 'DATE_PICKER', icon: '📅' }
  ];
}
