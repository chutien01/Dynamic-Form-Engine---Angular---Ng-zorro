import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { DynamicFormBuilderComponent } from './features/form-builder/dynamic-form-builder.component';

@Component({
  selector: 'app-root',
  imports: [DynamicFormBuilderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Hệ thống Dynamic Form');
}
