import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { TabsFieldSchema } from '../../../../../core/models/schema.model';
import { ContainerDropzoneComponent } from '../base/container-dropzone.component';

@Component({
  selector: 'app-tabs-field',
  imports: [NzTabsModule, ContainerDropzoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-4 bg-white p-4 rounded border border-gray-200">
      <nz-tabs [nzType]="field().tabType || 'line'" [nzTabPosition]="field().tabPosition || 'top'" class="w-full">
        @for (item of field().items; track item.id) {
          <nz-tab [nzTitle]="item.title">
            <div class="pt-4">
              <app-container-dropzone
                [containerId]="field().id"
                [itemId]="item.id"
                [fields]="item.fields || []"
                [formGroup]="formGroup()"
                [isBuilder]="isBuilder()"
                [label]="item.title"
              ></app-container-dropzone>
            </div>
          </nz-tab>
        }
      </nz-tabs>
    </div>
  `
})
export class TabsFieldComponent {
  readonly field = input.required<TabsFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
  readonly isBuilder = input<boolean>(false);
}
