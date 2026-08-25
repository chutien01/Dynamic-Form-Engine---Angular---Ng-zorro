import { Component, inject, viewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { FieldConfigModalComponent } from './components/field-config-modal/field-config-modal.component';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { FormBuilderStateService } from './services/form-builder.state.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { FormSchema } from '../../core/models/schema.model';

@Component({
  selector: 'app-dynamic-form-builder',
  imports: [
    ToolboxComponent, 
    CanvasComponent, 
    FieldConfigModalComponent,
    DynamicFormComponent,
    NzModalModule,
    JsonEditorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic-form-builder.component.html'
})
export class DynamicFormBuilderComponent {
  readonly isPreviewMode = signal(false);
  readonly isJsonModalVisible = signal(false);
  readonly editorData = signal<FormSchema | null>(null);

  readonly jsonEditor = viewChild<JsonEditorComponent>('jsonEditor');

  readonly state = inject(FormBuilderStateService);
  readonly messageService = inject(NzMessageService);
  readonly modalService = inject(NzModalService);
  
  readonly editorOptions = new JsonEditorOptions();

  constructor() {
    this.editorOptions.mode = 'code';
    this.editorOptions.modes = ['code', 'tree', 'view'];
    this.editorOptions.onChange = () => {};
    this.editorOptions.mainMenuBar = true;
  }

  togglePreview(): void {
    this.isPreviewMode.update(v => !v);
  }

  exportJson(): void {
    const json = JSON.stringify(this.state.schema(), null, 2);
    console.log(json);
    this.modalService.info({
      nzTitle: 'Schema JSON',
      nzContent: `<pre class="max-h-96 overflow-auto text-xs font-mono bg-gray-50 p-3 rounded">${json}</pre>`,
      nzWidth: 700,
      nzOkText: 'Đóng'
    });
  }
  
  openJsonEditor(): void {
    this.editorData.set(structuredClone(this.state.schema()));
    this.isJsonModalVisible.set(true);
  }
  
  closeJsonEditor(): void {
    this.isJsonModalVisible.set(false);
  }
  
  saveJson(): void {
    try {
      const editor = this.jsonEditor();
      if (!editor) return;
      
      const parsedData = (editor.get() as unknown) as FormSchema;
      if (!parsedData || !parsedData.formId) {
        throw new Error('Invalid schema structure: formId is required');
      }
      this.state.loadSchema(parsedData);
      this.isJsonModalVisible.set(false);
      this.messageService.success('JSON Schema applied successfully');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.messageService.error('Invalid JSON: ' + msg);
    }
  }

  onPreviewSubmit(data: Record<string, unknown>): void {
    this.modalService.success({
      nzTitle: 'Dữ liệu submit từ Preview',
      nzContent: `<pre class="max-h-80 overflow-auto text-xs font-mono bg-gray-50 p-3 rounded border border-gray-200">${JSON.stringify(data, null, 2)}</pre>`,
      nzWidth: 600,
      nzOkText: 'OK'
    });
  }
}
