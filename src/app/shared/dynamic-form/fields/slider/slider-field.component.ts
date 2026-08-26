import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { SliderFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-slider-field',
  imports: [ReactiveFormsModule, NzSliderModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng điều chỉnh ' + (field().label || 'trường này'))">
        <nz-slider 
          [formControlName]="field().key || field().id" 
          [nzMin]="field().min ?? 0" 
          [nzMax]="field().max ?? 100" 
          [nzStep]="field().step ?? 1">
        </nz-slider>
      </nz-form-control>
    </nz-form-item>
  `
})
export class SliderFieldComponent {
  readonly field = input.required<SliderFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
