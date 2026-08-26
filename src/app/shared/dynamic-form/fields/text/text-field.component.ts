import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TextFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-text-field',
  imports: [ReactiveFormsModule, NzInputModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng nhập ' + (field().label || 'trường này'))">
        <input nz-input [formControlName]="field().key || field().id" [id]="field().key || field().id" [placeholder]="field().placeholder || ''" />
      </nz-form-control>
    </nz-form-item>
  `
})
export class TextFieldComponent {
  readonly field = input.required<TextFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
