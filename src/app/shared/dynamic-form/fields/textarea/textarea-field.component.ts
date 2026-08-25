import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TextareaFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-textarea-field',
  imports: [ReactiveFormsModule, NzInputModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        <textarea nz-input [formControlName]="field().key || field().id" [id]="field().key || field().id" [placeholder]="field().placeholder || ''" rows="3"></textarea>
      </nz-form-control>
    </nz-form-item>
  `
})
export class TextareaFieldComponent {
  readonly field = input.required<TextareaFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
