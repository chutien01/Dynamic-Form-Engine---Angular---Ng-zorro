import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FormBuilderStateService } from './services/form-builder.state.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-dynamic-form-builder',
  imports: [
    CommonModule, 
    FormsModule,
    ToolboxComponent, 
    CanvasComponent, 
    PropertiesPanelComponent, 
    DynamicFormComponent,
    NzModalModule,
    JsonEditorComponent
  ],
  template: `
    <div class="flex flex-col h-screen w-full bg-gray-100 overflow-hidden font-sans">
      <!-- Header -->
      <div class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
        <h1 class="font-bold text-xl text-gray-800 flex items-center gap-2">
          <span>🛠️</span> Dynamic Form Builder
        </h1>
        <div class="flex gap-3">
           <button class="px-4 py-1.5 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition-colors" (click)="openJsonEditor()">
             Edit JSON
           </button>
           <button class="px-4 py-1.5 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition-colors" (click)="exportJson()">
             Export JSON
           </button>
           <button class="px-4 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors" (click)="togglePreview()">
             {{ isPreviewMode ? 'Back to Editor' : 'Preview Form' }}
           </button>
        </div>
      </div>

      <!-- Main Body -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Toolbox Column (Left) -->
        @if (!isPreviewMode) {
          <div class="w-72 flex-shrink-0 z-10 relative bg-white">
            <app-toolbox></app-toolbox>
          </div>
        }

        <!-- Canvas Column (Center) -->
        <div class="flex-grow z-0 overflow-y-auto bg-gray-100">
          @if (!isPreviewMode) {
            <app-canvas></app-canvas>
          } @else {
            <div class="p-8 h-full overflow-y-auto">
               <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
                 <h2 class="text-2xl font-bold mb-2">{{ state.schema().title }}</h2>
                 <p class="text-gray-500 mb-6">{{ state.schema().description }}</p>
                 <app-dynamic-form [schema]="state.schema()" (formSubmit)="onPreviewSubmit($event)"></app-dynamic-form>
               </div>
            </div>
          }
        </div>

        <!-- Properties Panel Column (Right) -->
        @if (!isPreviewMode) {
          <div class="w-80 flex-shrink-0 z-10 relative bg-white">
            <app-properties-panel></app-properties-panel>
          </div>
        }
      </div>
    </div>

    <!-- JSON Editor Modal -->
    <nz-modal 
      [(nzVisible)]="isJsonModalVisible" 
      nzTitle="Edit JSON Schema" 
      (nzOnCancel)="closeJsonEditor()" 
      (nzOnOk)="saveJson()"
      nzWidth="800px"
      nzOkText="Apply Changes"
      [nzBodyStyle]="{ padding: '0', height: '600px', display: 'flex', 'flex-direction': 'column' }">
      <ng-container *nzModalContent>
        <div style="flex-grow: 1; height: 100%; min-height: 0;">
          <json-editor [options]="editorOptions" [data]="editorData" #jsonEditor style="height: 100%; display: block;"></json-editor>
        </div>
      </ng-container>
    </nz-modal>
  `
})
export class DynamicFormBuilderComponent {
  isPreviewMode = false;
  state = inject(FormBuilderStateService);
  messageService = inject(NzMessageService);
  
  // JSON Editor properties
  isJsonModalVisible = false;
  editorOptions = new JsonEditorOptions();
  editorData: any = {};
  @ViewChild('jsonEditor') jsonEditor!: JsonEditorComponent;

  constructor() {
    this.editorOptions.mode = 'code';
    this.editorOptions.modes = ['code', 'tree', 'view'];
    this.editorOptions.onChange = () => {};
    this.editorOptions.mainMenuBar = true;
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
  }

  exportJson() {
    const json = JSON.stringify(this.state.schema(), null, 2);
    console.log(json);
    alert('Schema JSON đã được in ra console!\n\n' + json.substring(0, 500) + '...');
  }
  
  openJsonEditor() {
    this.editorData = JSON.parse(JSON.stringify(this.state.schema()));
    this.isJsonModalVisible = true;
  }
  
  closeJsonEditor() {
    this.isJsonModalVisible = false;
  }
  
  saveJson() {
    try {
      const parsedData: any = this.jsonEditor.get();
      if (!parsedData || !parsedData.formId) {
        throw new Error("Invalid schema structure");
      }
      this.state.loadSchema(parsedData);
      this.isJsonModalVisible = false;
      this.messageService.success('JSON Schema applied successfully');
    } catch (e: any) {
      this.messageService.error('Invalid JSON syntax: ' + e.message);
    }
  }

  onPreviewSubmit(data: any) {
    alert('Dữ liệu submit từ Preview:\n' + JSON.stringify(data, null, 2));
  }
}
