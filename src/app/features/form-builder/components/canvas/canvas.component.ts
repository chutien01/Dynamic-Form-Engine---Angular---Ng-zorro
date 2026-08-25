import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilderStateService } from '../../services/form-builder.state.service';
import { FieldType } from '../../../../core/models/schema.model';
import { FieldRegistryService } from '../../../../shared/dynamic-form/services/field-registry.service';

interface FieldTypeItem {
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-canvas',
  imports: [
    CommonModule, 
    DragDropModule, 
    NzGridModule,
    NzButtonModule,
    NzDropDownModule,
    NzTooltipModule,
    NzPopconfirmModule
  ],
  template: `
    <div class="p-6 bg-gray-100 h-full overflow-y-auto" (click)="onCanvasClick()">
      <div class="bg-white p-8 rounded-lg shadow-md min-h-[500px]">
        <h2 class="text-2xl font-bold mb-2">{{ state.schema().title || 'Untitled Form' }}</h2>
        <p class="text-gray-500 mb-6">{{ state.schema().description || 'No description provided' }}</p>
        
        <div 
          nz-row [nzGutter]="[16, 16]"
          id="canvasList"
          class="min-h-[300px] border-2 border-dashed border-gray-300 p-4 rounded transition-colors"
          [class.bg-blue-50]="isDragging"
          cdkDropList 
          [cdkDropListData]="state.schema().fields"
          (cdkDropListDropped)="onDrop($event)"
          (cdkDropListEntered)="isDragging = true"
          (cdkDropListExited)="isDragging = false"
        >
          @if (!state.schema().fields.length) {
            <div class="text-center text-gray-400 py-20 pointer-events-none w-full">
              <span class="text-4xl block mb-2">⬇️</span>
              Kéo thả các thành phần từ Toolbox vào đây
            </div>
          }
          
          @for (field of state.schema().fields; track field.id) {
            <div 
              nz-col [nzSpan]="field.gridSpan || 24"
              class="p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition-all relative group"
              [ngClass]="state.activeFieldId() === field.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-400'"
              (click)="onFieldClick($event, field.id)"
              cdkDrag
            >
              <!-- Drag handle -->
              <div 
                class="absolute -left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow border border-gray-200 transition-opacity z-10" 
                cdkDragHandle
                title="Kéo để sắp xếp lại"
              >
                <svg width="18px" height="18px" fill="currentColor" viewBox="0 0 24 24"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"></path></svg>
              </div>
              
              <!-- Header with Label, Type, and Actions -->
              <div class="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <div class="flex items-center gap-2 overflow-hidden mr-2">
                  <label class="font-semibold text-gray-800 truncate select-none cursor-pointer">
                    @if (field.required) {
                      <span class="text-red-500 font-bold ml-0.5">*</span>
                    }
                  </label>
                  <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex-shrink-0">{{ field.type }}</span>
                  <span class="text-xs font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex-shrink-0" [title]="'Key: ' + (field.key || field.id)">
                    {{ field.key || field.id }}
                  </span>
                </div>

                <!-- Field Actions Toolbar -->
                <div class="flex items-center gap-0.5 bg-gray-50 p-1 rounded border border-gray-200 shadow-xs flex-shrink-0" (click)="$event.stopPropagation()">
                  <!-- Add Before -->
                  <button 
                    type="button"
                    nz-button 
                    nzType="text" 
                    nzSize="small" 
                    nz-dropdown 
                    [nzDropdownMenu]="menuBefore" 
                    nzTrigger="click"
                    nzPlacement="bottomRight"
                    nz-tooltip 
                    nzTooltipTitle="Thêm phía trước (Add Before)"
                    class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 rounded hover:!bg-blue-50 !text-gray-600 hover:!text-blue-600"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="9" x2="12" y2="21"></line>
                      <line x1="6" y1="15" x2="18" y2="15"></line>
                      <polyline points="7 6 12 1 17 6"></polyline>
                    </svg>
                  </button>
                  <nz-dropdown-menu #menuBefore="nzDropdownMenu">
                    <ul nz-menu class="min-w-44 py-1 rounded shadow-lg border border-gray-100">
                      <li nz-menu-item-group nzTitle="Thêm trường phía trước">
                        @for (item of fieldTypes; track item.type) {
                          <li nz-menu-item (click)="addBefore(field.id, item.type, $event)" class="flex items-center gap-2">
                            <span>{{ item.icon }}</span>
                            <span>{{ item.label }}</span>
                          </li>
                        }
                      </li>
                    </ul>
                  </nz-dropdown-menu>

                  <!-- Add After -->
                  <button 
                    type="button"
                    nz-button 
                    nzType="text" 
                    nzSize="small" 
                    nz-dropdown 
                    [nzDropdownMenu]="menuAfter" 
                    nzTrigger="click"
                    nzPlacement="bottomRight"
                    nz-tooltip 
                    nzTooltipTitle="Thêm phía sau (Add After)"
                    class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 rounded hover:!bg-blue-50 !text-gray-600 hover:!text-blue-600"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                      <line x1="6" y1="9" x2="18" y2="9"></line>
                      <polyline points="7 18 12 23 17 18"></polyline>
                    </svg>
                  </button>
                  <nz-dropdown-menu #menuAfter="nzDropdownMenu">
                    <ul nz-menu class="min-w-44 py-1 rounded shadow-lg border border-gray-100">
                      <li nz-menu-item-group nzTitle="Thêm trường phía sau">
                        @for (item of fieldTypes; track item.type) {
                          <li nz-menu-item (click)="addAfter(field.id, item.type, $event)" class="flex items-center gap-2">
                            <span>{{ item.icon }}</span>
                            <span>{{ item.label }}</span>
                          </li>
                        }
                      </li>
                    </ul>
                  </nz-dropdown-menu>

                  <!-- Divider -->
                  <div class="h-3.5 w-px bg-gray-300 mx-0.5"></div>

                  <!-- Duplicate -->
                  <button 
                    type="button"
                    nz-button 
                    nzType="text" 
                    nzSize="small" 
                    nz-tooltip 
                    nzTooltipTitle="Nhân bản (Duplicate)"
                    (click)="duplicate(field.id, $event)"
                    class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 rounded hover:!bg-emerald-50 !text-gray-600 hover:!text-emerald-600"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>

                  <!-- Delete -->
                  <button 
                    type="button"
                    nz-button 
                    nzType="text" 
                    nzSize="small" 
                    nz-tooltip 
                    nzTooltipTitle="Xóa trường (Delete)"
                    nz-popconfirm
                    nzPopconfirmTitle="Bạn có chắc muốn xóa trường này?"
                    nzOkText="Xóa"
                    nzCancelText="Hủy"
                    nzOkDanger
                    (nzOnConfirm)="delete(field.id)"
                    (click)="$event.stopPropagation()"
                    class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 rounded hover:!bg-red-50 !text-gray-600 hover:!text-red-600"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Dynamic Field Component Render (Disabled mode) -->
              <div class="pointer-events-none">
                <ng-container *ngComponentOutlet="
                    registry.getComponent(field.type); 
                    inputs: { field: field, formGroup: dummyFormGroup }
                "></ng-container>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CanvasComponent {
  state = inject(FormBuilderStateService);
  registry = inject(FieldRegistryService);
  fb = inject(FormBuilder);
  messageService = inject(NzMessageService);
  
  isDragging = false;
  dummyFormGroup: FormGroup = this.fb.group({});

  fieldTypes: FieldTypeItem[] = [
    { type: FieldType.TEXT_INPUT, label: 'TEXT_INPUT', icon: '📝' },
    { type: FieldType.TEXT_AREA, label: 'TEXT_AREA', icon: '📄' },
    { type: FieldType.NUMBER, label: 'NUMBER', icon: '🔢' },
    { type: FieldType.SELECT, label: 'SELECT', icon: '🔽' },
    { type: FieldType.RADIO_GROUP, label: 'RADIO_GROUP', icon: '🔘' },
    { type: FieldType.CHECKBOX, label: 'CHECKBOX', icon: '☑️' },
    { type: FieldType.DATE_PICKER, label: 'DATE_PICKER', icon: '📅' }
  ];

  constructor() {
    effect(() => {
      const fields = this.state.schema().fields;
      const group: any = {};
      fields.forEach(field => {
        const controlKey = field.key || field.id;
        group[controlKey] = [{ value: field.defaultValue || '', disabled: true }];
      });
      this.dummyFormGroup = this.fb.group(group);
    });
  }

  onDrop(event: CdkDragDrop<any>): void {
    this.isDragging = false;
    if (event.previousContainer === event.container) {
      this.state.moveField(event.previousIndex, event.currentIndex);
    } else {
      const fieldType = event.item.data as FieldType;
      if (fieldType) {
        this.state.addField(fieldType, event.currentIndex);
      }
    }
  }

  onFieldClick(event: MouseEvent, fieldId: string): void {
    event.stopPropagation();
    this.state.setActiveField(fieldId);
  }

  onCanvasClick(): void {
    this.state.setActiveField(null);
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
}

