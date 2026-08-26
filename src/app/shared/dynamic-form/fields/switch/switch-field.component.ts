import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzFormModule } from 'ng-zorro-antd/form';
import { SwitchFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-switch-field',
  imports: [ReactiveFormsModule, NzSwitchModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng kiểm tra ' + (field().label || 'trường này'))">
        <nz-switch [formControlName]="field().key || field().id" [id]="field().key || field().id"></nz-switch>
      </nz-form-control>
    </nz-form-item>
  `
})
export class SwitchFieldComponent {
  readonly field = input.required<SwitchFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
