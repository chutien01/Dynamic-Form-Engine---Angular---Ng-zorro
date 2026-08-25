import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { CollapseFieldSchema } from '../../../../../core/models/schema.model';
import { ContainerDropzoneComponent } from '../base/container-dropzone.component';

@Component({
  selector: 'app-collapse-field',
  imports: [NzCollapseModule, ContainerDropzoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-4">
      <nz-collapse [nzAccordion]="!!field().accordion" [nzBordered]="field().bordered ?? true">
        @for (item of field().items; track item.id; let first = $first) {
          <nz-collapse-panel [nzHeader]="item.title" [nzActive]="first">
            <app-container-dropzone
              [containerId]="field().id"
              [itemId]="item.id"
              [fields]="item.fields || []"
              [formGroup]="formGroup()"
              [isBuilder]="isBuilder()"
              [label]="item.title"
            ></app-container-dropzone>
          </nz-collapse-panel>
        }
      </nz-collapse>
    </div>
  `
})
export class CollapseFieldComponent {
  readonly field = input.required<CollapseFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
  readonly isBuilder = input<boolean>(false);
}
