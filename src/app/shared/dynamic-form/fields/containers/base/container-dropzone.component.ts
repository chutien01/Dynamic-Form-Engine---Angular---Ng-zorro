import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgComponentOutlet } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FieldConditions, FieldSchema, FieldType } from '../../../../../core/models/schema.model';
import { FormBuilderStateService } from '../../../../../features/form-builder/services/form-builder.state.service';
import { FieldRegistryService } from '../../../services/field-registry.service';

@Component({
  selector: 'app-container-dropzone',
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
  template: `
    @if (isBuilder()) {
      <div 
        nz-row [nzGutter]="[12, 16]"
        [id]="'container_' + (itemId() || containerId())"
        class="min-h-[100px] items-start content-start border-2 border-dashed border-indigo-200 rounded-xl p-3 bg-indigo-50/20 w-full"
        cdkDropList
        [cdkDropListData]="fields()"
        [cdkDropListConnectedTo]="state.connectedDropLists()"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (child of fields(); track child.id) {
          <div 
            nz-col [nzSpan]="child.gridSpan || 24"
            class="pt-[33px] pb-2 px-4 border rounded-xl shadow-2xs bg-white cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative group/child"
            [class.border-blue-500]="state.activeFieldId() === child.id"
            [class.ring-2]="state.activeFieldId() === child.id"
            [class.ring-blue-100]="state.activeFieldId() === child.id"
            [class.border-slate-200]="state.activeFieldId() !== child.id"
            [class.hover:border-blue-300]="state.activeFieldId() !== child.id"
            (click)="onSelect($event, child.id)"
            cdkDrag
          >
            <!-- Custom Drag Placeholder in Container -->
            <div 
              *cdkDragPlaceholder 
              class="w-full border-2 border-dashed border-blue-500 bg-blue-50/80 rounded-xl min-h-[58px] flex items-center justify-center text-blue-600 font-semibold text-xs my-1 gap-2 shadow-inner"
            >
              <span>📥</span>
              <span>Thả vào vị trí này</span>
            </div>

            <!-- Custom Drag Preview in Container -->
            <div 
              *cdkDragPreview 
              class="bg-white border-2 border-blue-500 rounded-xl shadow-2xl p-3 opacity-95 max-w-sm flex items-center gap-2.5 pointer-events-none"
            >
              <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase">
                {{ child.type }}
              </span>
              <span class="text-xs font-semibold text-gray-800 truncate">
                {{ child.label || (child.key || child.id) }}
              </span>
            </div>

            <!-- Floating Badges: Field Type & Condition (Top-Left Border) -->
            <div 
              class="absolute -top-3 left-4 z-20 opacity-0 group-hover/child:opacity-100 transition-all flex items-center gap-1.5 pointer-events-none"
              [class.opacity-100]="state.activeFieldId() === child.id"
            >
              <span class="text-[10px] font-bold font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs uppercase">
                {{ child.type }}
              </span>
              @if (child.conditions?.rules?.length) {
                <span 
                  class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs flex items-center gap-1"
                  [title]="'Điều kiện: ' + child.conditions!.action + ' khi ' + getConditionSummary(child.conditions)"
                >
                  <span>⚡</span>
                  <span>{{ child.conditions!.action }}</span>
                </span>
              }
            </div>

            <!-- Floating Action Toolbar (Top-Right Border) -->
            <div 
              class="absolute -top-4 right-4 z-20 opacity-0 group-hover/child:opacity-100 transition-all bg-white shadow-md border border-slate-200 rounded-full px-1.5 py-1 flex items-center gap-1 scale-95 group-hover/child:scale-100"
              [class.opacity-100]="state.activeFieldId() === child.id"
              [class.scale-100]="state.activeFieldId() === child.id"
              (click)="$event.stopPropagation()"
            >
              <!-- Edit / Settings (Amber Accent) -->
              <button 
                type="button" 
                nz-button 
                nzType="text" 
                nzSize="small" 
                nz-tooltip 
                nzTooltipTitle="Cài đặt trường (Settings)"
                (click)="openSettings(child.id, $event)"
                class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 !rounded-full !bg-amber-50 hover:!bg-amber-100 !text-amber-600 transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              <!-- Add Before (Blue Accent) -->
              <button 
                type="button" 
                nz-button 
                nzType="text" 
                nzSize="small" 
                nz-dropdown 
                [nzDropdownMenu]="childMenuBefore" 
                nzTrigger="click"
                nzPlacement="bottomRight"
                nz-tooltip 
                nzTooltipTitle="Thêm phía trước"
                class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 !rounded-full !bg-blue-50 hover:!bg-blue-100 !text-blue-600 transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="9" x2="12" y2="21"></line>
                  <line x1="6" y1="15" x2="18" y2="15"></line>
                  <polyline points="7 6 12 1 17 6"></polyline>
                </svg>
              </button>
              <nz-dropdown-menu #childMenuBefore="nzDropdownMenu">
                <ul nz-menu class="min-w-44 py-1 rounded-lg shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                  <li nz-menu-item-group nzTitle="Thêm trường phía trước">
                    @for (item of childFieldTypes; track item.type) {
                      <li nz-menu-item (click)="onAddBefore(child.id, item.type, $event)" class="flex items-center gap-2">
                        <span>{{ item.icon }}</span>
                        <span class="font-medium text-xs">{{ item.label }}</span>
                      </li>
                    }
                  </li>
                </ul>
              </nz-dropdown-menu>

              <!-- Add After (Indigo Accent) -->
              <button 
                type="button" 
                nz-button 
                nzType="text" 
                nzSize="small" 
                nz-dropdown 
                [nzDropdownMenu]="childMenuAfter" 
                nzTrigger="click"
                nzPlacement="bottomRight"
                nz-tooltip 
                nzTooltipTitle="Thêm phía sau"
                class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 !rounded-full !bg-indigo-50 hover:!bg-indigo-100 !text-indigo-600 transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                  <line x1="6" y1="9" x2="18" y2="9"></line>
                  <polyline points="7 18 12 23 17 18"></polyline>
                </svg>
              </button>
              <nz-dropdown-menu #childMenuAfter="nzDropdownMenu">
                <ul nz-menu class="min-w-44 py-1 rounded-lg shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                  <li nz-menu-item-group nzTitle="Thêm trường phía sau">
                    @for (item of childFieldTypes; track item.type) {
                      <li nz-menu-item (click)="onAddAfter(child.id, item.type, $event)" class="flex items-center gap-2">
                        <span>{{ item.icon }}</span>
                        <span class="font-medium text-xs">{{ item.label }}</span>
                      </li>
                    }
                  </li>
                </ul>
              </nz-dropdown-menu>

              <div class="h-3.5 w-px bg-slate-200 mx-0.5"></div>

              <!-- Duplicate (Emerald Accent) -->
              <button 
                type="button" 
                nz-button 
                nzType="text" 
                nzSize="small" 
                nz-tooltip 
                nzTooltipTitle="Nhân bản"
                (click)="onDuplicate(child.id, $event)"
                class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 !rounded-full !bg-emerald-50 hover:!bg-emerald-100 !text-emerald-600 transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>

              <!-- Delete (Rose Accent) -->
              <button 
                type="button" 
                nz-button 
                nzType="text" 
                nzSize="small" 
                nz-tooltip 
                nzTooltipTitle="Xóa trường"
                nz-popconfirm
                nzPopconfirmTitle="Bạn có chắc muốn xóa trường này?"
                nzOkText="Xóa"
                nzCancelText="Hủy"
                nzOkDanger
                (nzOnConfirm)="deleteChild(child.id)"
                (click)="$event.stopPropagation()"
                class="!flex !items-center !justify-center !w-6 !h-6 !p-0 !min-w-0 !rounded-full !bg-rose-50 hover:!bg-rose-100 !text-rose-600 transition-colors shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>

            <div>
              <ng-container *ngComponentOutlet="
                registry.getComponent(child.type); 
                inputs: { field: child, formGroup: formGroup(), isBuilder: false }
              "></ng-container>
            </div>
          </div>
        }

        <!-- Centered + Button inside this dropzone -->
        <div class="w-full flex flex-col items-center justify-center py-4 text-center">
          <button 
            type="button" 
            nz-button 
            nzType="dashed"
            nz-dropdown 
            [nzDropdownMenu]="addMenu"
            (click)="$event.stopPropagation()"
            class="!flex !items-center !gap-1.5 !rounded-full !px-5 !py-2 !border-indigo-400 hover:!border-indigo-600 hover:!text-indigo-600 !bg-white shadow-sm transition-all"
          >
            <span class="text-lg font-bold text-indigo-600">+</span>
            <span class="text-xs font-semibold">Thêm trường vào {{ label() || 'Container' }}</span>
          </button>
          <nz-dropdown-menu #addMenu="nzDropdownMenu">
            <ul nz-menu class="max-h-60 overflow-y-auto">
              @for (ft of childFieldTypes; track ft.type) {
                <li nz-menu-item (click)="onAdd(ft.type, $event)">
                  <span class="mr-2">{{ ft.icon }}</span>
                  <span>{{ ft.label }}</span>
                </li>
              }
            </ul>
          </nz-dropdown-menu>
        </div>
      </div>
    } @else {
      <!-- RUNNER MODE: Clean layout without dropzone or builder buttons -->
      <div nz-row [nzGutter]="16" class="w-full">
        @if (!fields().length) {
          <div class="text-gray-400 text-xs py-4 text-center w-full">Trống</div>
        }
        @for (child of fields(); track child.id) {
          <div nz-col [nzSpan]="child.gridSpan || 24">
            <ng-container *ngComponentOutlet="
              registry.getComponent(child.type); 
              inputs: { field: child, formGroup: formGroup(), isBuilder: false }
            "></ng-container>
          </div>
        }
      </div>
    }
  `
})
export class ContainerDropzoneComponent {
  readonly containerId = input.required<string>();
  readonly itemId = input<string | null>(null);
  readonly fields = input.required<FieldSchema[]>();
  readonly formGroup = input.required<FormGroup>();
  readonly isBuilder = input<boolean>(false);
  readonly label = input<string>('');

  protected readonly state = inject(FormBuilderStateService);
  protected readonly registry = inject(FieldRegistryService);
  private readonly messageService = inject(NzMessageService);

  readonly childFieldTypes: readonly { type: FieldType; label: string; icon: string }[] = [
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

  onSelect(event: MouseEvent, childId: string): void {
    event.stopPropagation();
    this.state.openConfigModal(childId);
  }

  openSettings(childId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.state.openConfigModal(childId);
  }

  deleteChild(childId: string): void {
    this.state.deleteField(childId);
    this.messageService.success('Đã xóa trường');
  }

  onDuplicate(childId: string, event: MouseEvent): void {
    event.stopPropagation();
    const newId = this.state.duplicateField(childId);
    if (newId) {
      this.messageService.success('Đã nhân bản trường');
    }
  }

  onAddBefore(childId: string, type: FieldType, event: MouseEvent): void {
    event.stopPropagation();
    this.state.addFieldBefore(childId, type);
    this.messageService.success('Đã thêm trường phía trước');
  }

  onAddAfter(childId: string, type: FieldType, event: MouseEvent): void {
    event.stopPropagation();
    this.state.addFieldAfter(childId, type);
    this.messageService.success('Đã thêm trường phía sau');
  }

  onAdd(type: FieldType, event: MouseEvent): void {
    event.stopPropagation();
    this.state.addChildField(this.containerId(), this.itemId(), type);
    this.messageService.success('Đã thêm trường vào Container');
  }

  onDrop(event: CdkDragDrop<FieldSchema[], unknown, FieldType>): void {
    event.event.stopPropagation();
    if (event.previousContainer === event.container) {
      this.state.moveChildField(this.containerId(), this.itemId(), event.previousIndex, event.currentIndex);
    } else {
      const fieldType = event.item.data as FieldType;
      if (fieldType) {
        this.state.addChildField(this.containerId(), this.itemId(), fieldType, event.currentIndex, true);
      }
    }
  }

  getConditionSummary(conditions: FieldConditions | undefined): string {
    if (!conditions || !conditions.rules?.length) return '';
    return conditions.rules
      .map(r => `${r.fieldKey} ${r.operator} ${r.value ?? ''}`)
      .join(conditions.matchType === 'any' ? ' OR ' : ' AND ');
  }
}
