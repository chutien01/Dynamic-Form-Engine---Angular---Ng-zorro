import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzFormModule } from 'ng-zorro-antd/form';
import { RadioFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-radio-field',
  imports: [ReactiveFormsModule, NzRadioModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng chọn ' + (field().label || 'trường này'))">
        <nz-radio-group [formControlName]="field().key || field().id" [id]="field().key || field().id">
          @for (option of field().options; track option.value) {
            <label nz-radio [nzValue]="option.value">{{ option.label }}</label>
          }
        </nz-radio-group>
      </nz-form-control>
    </nz-form-item>
  `
})
export class RadioFieldComponent {
  readonly field = input.required<RadioFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
