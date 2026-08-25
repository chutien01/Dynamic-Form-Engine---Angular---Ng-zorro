import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CardFieldSchema } from '../../../../../core/models/schema.model';
import { ContainerDropzoneComponent } from '../base/container-dropzone.component';

@Component({
  selector: 'app-card-field',
  imports: [NzCardModule, ContainerDropzoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-card [nzTitle]="field().label" [nzBordered]="field().bordered ?? true" class="w-full mb-4">
      <app-container-dropzone
        [containerId]="field().id"
        [fields]="field().fields || []"
        [formGroup]="formGroup()"
        [isBuilder]="isBuilder()"
        [label]="field().label"
      ></app-container-dropzone>
    </nz-card>
  `
})
export class CardFieldComponent {
  readonly field = input.required<CardFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
  readonly isBuilder = input<boolean>(false);
}
