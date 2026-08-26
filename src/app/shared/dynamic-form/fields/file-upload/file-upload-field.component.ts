import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzUploadModule, NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FileUploadFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-file-upload-field',
  imports: [ReactiveFormsModule, NzUploadModule, NzButtonModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng tải lên tệp cho ' + (field().label || 'trường này'))">
        <nz-upload
          [nzAccept]="field().accept || ''"
          [nzMultiple]="(field().maxCount ?? 1) > 1"
          [nzFileList]="fileList()"
          [nzLimit]="field().maxCount || 1"
          [nzBeforeUpload]="beforeUpload"
          (nzChange)="handleChange($event)"
        >
          <button nz-button type="button" class="flex items-center gap-1.5">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Select File</span>
          </button>
        </nz-upload>
      </nz-form-control>
    </nz-form-item>
  `
})
export class FileUploadFieldComponent {
  readonly field = input.required<FileUploadFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
  readonly fileList = signal<NzUploadFile[]>([]);

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList.update(list => [...list, file]);
    const controlKey = this.field().key || this.field().id;
    this.formGroup().get(controlKey)?.setValue(this.fileList());
    return false;
  };

  handleChange(info: NzUploadChangeParam): void {
    this.fileList.set(info.fileList);
    const controlKey = this.field().key || this.field().id;
    this.formGroup().get(controlKey)?.setValue(info.fileList);
  }
}
