import { FieldType } from '../../models/schema/field-type.enum';
import { FileUploadFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class FileUploadFieldBuilder extends BaseFieldBuilder<FileUploadFieldSchema> {
  constructor() {
    super(FieldType.FILE_UPLOAD);
    this.schema.maxCount = 1;
  }

  setMaxCount(maxCount: number): this {
    this.schema.maxCount = maxCount;
    return this;
  }

  setAccept(accept: string): this {
    this.schema.accept = accept;
    return this;
  }
}
