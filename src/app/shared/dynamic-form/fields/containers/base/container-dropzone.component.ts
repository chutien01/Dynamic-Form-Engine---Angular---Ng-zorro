import { Component, input, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { NgComponentOutlet } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FieldConditions, FieldSchema, FieldType } from '../../../../../core/models/schema.model';
import { ConditionEvaluatorService } from '../../../../../core/services/condition-evaluator.service';
import { FormBuilderStateService } from '../../../../../features/form-builder/services/form-builder.state.service';
import { FieldRegistryService } from '../../../services/field-registry.service';

export interface ChildFieldTypeItem {
  type: FieldType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-container-dropzone',
  imports: [
    FormsModule,
    NgComponentOutlet,
    DragDropModule,
    NzGridModule,
    NzButtonModule,
    NzDropdownModule,
    NzTooltipModule,
    NzPopconfirmModule,
    NzModalModule,
    NzInputModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isBuilder()) {
      <div 
        nz-row [nzGutter]="[12, 16]"
        [id]="'container_' + (itemId() || containerId())"
        class="min-h-[110px] items-start content-start border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-xl p-3.5 bg-indigo-50/20 w-full transition-all cursor-pointer relative"
        cdkDropList
        [cdkDropListData]="fields()"
        [cdkDropListConnectedTo]="state.connectedDropLists()"
        (cdkDropListDropped)="onDrop($event)"
        (click)="openAddModal($event)"
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

            <div [class.pointer-events-none]="isBuilder()" [class.select-none]="isBuilder()">
              <ng-container *ngComponentOutlet="
                registry.getComponent(child.type); 
                inputs: { field: child, formGroup: formGroup(), isBuilder: isBuilder() }
              "></ng-container>
            </div>
          </div>
        }

        <!-- Dropzone Empty / Add Prompt in Center -->
        @if (!fields().length) {
          <div class="w-full py-6 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold mb-2 shadow-2xs">
              +
            </div>
            <span class="text-xs font-semibold text-indigo-700">Nhấp vào đây để thêm trường vào {{ label() || 'Container' }}</span>
            <span class="text-[11px] text-indigo-400 mt-0.5">hoặc kéo thả trường từ Toolbox vào vùng này</span>
          </div>
        } @else {
          <div class="w-full flex items-center justify-center pt-2 pb-1 text-center">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-indigo-300 bg-white/90 text-indigo-600 text-xs font-medium shadow-2xs pointer-events-none">
              <span class="font-bold text-sm">+</span>
              <span>Nhấp vào vùng trống để thêm trường</span>
            </span>
          </div>
        }
      </div>

      <!-- Modal Add Field to Container with Search Input -->
      <nz-modal
        [nzVisible]="isAddModalOpen()"
        [nzTitle]="modalTitleTpl"
        [nzFooter]="null"
        [nzWidth]="640"
        (nzOnCancel)="isAddModalOpen.set(false)"
        [nzCentered]="true"
      >
        <ng-template #modalTitleTpl>
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base text-indigo-600">
              📦
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-800 !mb-0">Thêm trường vào {{ label() || 'Container' }}</h4>
              <p class="text-xs text-gray-500 font-normal !mb-0">Tìm kiếm hoặc chọn loại trường nhập liệu để chèn vào vùng chứa</p>
            </div>
          </div>
        </ng-template>

        <ng-container *nzModalContent>
          <div class="py-2">
            <!-- Search Field Input -->
            <div class="mb-3.5">
              <nz-input-group [nzPrefix]="searchPrefixTpl" class="!rounded-xl !bg-slate-50 border border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input 
                  nz-input 
                  [ngModel]="searchQuery()" 
                  (ngModelChange)="searchQuery.set($event)"
                  placeholder="Tìm kiếm trường (Text, Number, Date, Select, Switch...)" 
                  class="!bg-transparent text-xs py-1.5"
                />
              </nz-input-group>
              <ng-template #searchPrefixTpl>
                <span class="text-gray-400 text-xs mr-1">🔍</span>
              </ng-template>
            </div>

            <!-- Field Cards Grid -->
            <div class="max-h-[55vh] overflow-y-auto pr-1">
              @if (filteredChildFieldTypes().length > 0) {
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  @for (ft of filteredChildFieldTypes(); track ft.type) {
                    <button
                      type="button"
                      (click)="onSelectFieldType(ft.type)"
                      class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/40 text-left transition-all group shadow-2xs hover:shadow-md cursor-pointer w-full"
                    >
                      <div class="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                        {{ ft.icon }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <span class="text-xs font-bold text-gray-800 group-hover:text-indigo-600 block truncate">
                          {{ ft.label }}
                        </span>
                        <span class="text-[10px] font-mono text-gray-400 uppercase block truncate">
                          {{ ft.type }}
                        </span>
                      </div>
                    </button>
                  }
                </div>
              } @else {
                <div class="py-8 text-center text-gray-400 flex flex-col items-center justify-center">
                  <span class="text-2xl mb-1.5">🔍</span>
                  <span class="text-xs font-semibold text-gray-600">Không tìm thấy trường nào phù hợp</span>
                  <span class="text-[11px] text-gray-400 mt-0.5">Hãy thử tìm với từ khóa khác (ví dụ: Text, Date, Select...)</span>
                </div>
              }
            </div>
          </div>
        </ng-container>
      </nz-modal>
    } @else {
      <!-- RUNNER MODE: Clean layout without dropzone or builder buttons -->
      <div nz-row [nzGutter]="16" class="w-full">
        @if (!fields().length) {
          <div class="text-gray-400 text-xs py-4 text-center w-full">Trống</div>
        }
        @for (child of fields(); track child.id) {
          @if (isChildVisible(child)) {
            <div nz-col [nzSpan]="child.gridSpan || 24">
              <ng-container *ngComponentOutlet="
                registry.getComponent(child.type); 
                inputs: { field: child, formGroup: formGroup(), isBuilder: false }
              "></ng-container>
            </div>
          }
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

  readonly isAddModalOpen = signal(false);
  readonly searchQuery = signal('');

  protected readonly state = inject(FormBuilderStateService);
  protected readonly registry = inject(FieldRegistryService);
  private readonly messageService = inject(NzMessageService);
  private readonly evaluator = inject(ConditionEvaluatorService);

  isChildVisible(child: FieldSchema): boolean {
    return this.evaluator.isFieldVisible(child, this.formGroup().getRawValue());
  }

  readonly childFieldTypes: readonly ChildFieldTypeItem[] = [
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

  readonly filteredChildFieldTypes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.childFieldTypes;
    return this.childFieldTypes.filter(ft => 
      ft.label.toLowerCase().includes(q) || 
      ft.type.toLowerCase().includes(q)
    );
  });

  openAddModal(event: MouseEvent): void {
    event.stopPropagation();
    this.searchQuery.set('');
    this.isAddModalOpen.set(true);
  }

  onSelectFieldType(type: FieldType): void {
    this.state.addChildField(this.containerId(), this.itemId(), type);
    this.isAddModalOpen.set(false);
  }

  onSelect(event: MouseEvent, childId: string): void {
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
