# Kế hoạch triển khai hệ thống Dynamic Form (Drag & Drop) với Schema & Builder Pattern

Tài liệu này mô tả lộ trình và cấu trúc kiến trúc để xây dựng một hệ thống Dynamic Form mạnh mẽ, cho phép người dùng kéo thả (drag & drop) để tạo form. Mọi thao tác đều làm việc với một JSON Schema làm cốt lõi, và sử dụng Builder Pattern để tạo và quản lý cấu trúc schema này.

## 1. Tổng quan hệ thống (System Overview)

Hệ thống sẽ bao gồm 2 phần chính:
1. **Form Builder (Chế độ thiết kế)**: Giao diện kéo thả cho phép admin thiết kế form. Bao gồm thanh công cụ các loại field, khu vực kéo thả (canvas), và panel cấu hình thuộc tính (properties).
2. **Form Renderer (Chế độ hiển thị)**: Component tiếp nhận một JSON Schema (được sinh ra từ Builder) và render ra giao diện form thực tế để người dùng cuối nhập liệu.

Công nghệ sử dụng:
- **Framework**: Angular 22 (Signals, Standalone Components).
- **UI Library**: NG-ZORRO (các input, select, grid system) & TailwindCSS (layout, utility).
- **Drag & Drop**: Dùng `@angular/cdk/drag-drop` để tối ưu trải nghiệm.
- **UUID**: Sử dụng package `uuid` (uuidv4) để tạo unique ID.

---

## 2. Thiết kế Kiến trúc Lõi (Core Architecture)

Để đảm bảo hệ thống dễ bảo trì và mở rộng, phần lõi sẽ được thiết kế ngay từ đầu bằng **Builder Pattern** và cấu trúc **JSON Schema** chuẩn.

### 2.1. Định nghĩa Schema (Models & Interfaces)

```typescript
// Định nghĩa các loại input được hỗ trợ
export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date';

// Schema cơ bản cho một Field
export interface FieldSchema {
  id: string;             // ID duy nhất (uuidv4)
  type: FieldType;        // Loại field
  label: string;          // Tên field hiển thị
  placeholder?: string;
  required?: boolean;
  options?: any[];        // Cho select, radio (ví dụ: {label: 'A', value: 1})
  defaultValue?: any;
  gridSpan?: number;      // Dành cho hệ thống grid (1-24 của ng-zorro)
  validations?: any[];    // Các rule validate nâng cao (min, max, pattern,...)
}

// Schema tổng thể của toàn bộ Form
export interface FormSchema {
  formId: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
  layout: 'horizontal' | 'vertical' | 'inline';
}
```

### 2.2. Xây dựng Builder Pattern (Core Logic)

Builder Pattern giúp chúng ta tạo và mutate (thay đổi) Schema một cách có lập trình, dễ kiểm soát mà không cần sửa đổi trực tiếp object data.

```typescript
import { v4 as uuidv4 } from 'uuid';

// Field Builder
export class FieldBuilder {
  private schema: FieldSchema;

  constructor(type: FieldType) {
    this.schema = {
      id: uuidv4(),
      type: type,
      label: 'New Field',
      gridSpan: 24, // Mặc định full width
    };
  }

  setLabel(label: string): this { this.schema.label = label; return this; }
  setRequired(req: boolean): this { this.schema.required = req; return this; }
  setOptions(options: any[]): this { this.schema.options = options; return this; }
  // ... các setter khác

  build(): FieldSchema {
    return this.schema;
  }
}

// Form Builder
export class FormSchemaBuilder {
  private formSchema: FormSchema;

  constructor(title: string) {
    this.formSchema = {
      formId: uuidv4(),
      title,
      fields: [],
      layout: 'vertical'
    };
  }

  addField(field: FieldSchema): this {
    this.formSchema.fields.push(field);
    return this;
  }

  removeField(fieldId: string): this {
    this.formSchema.fields = this.formSchema.fields.filter(f => f.id !== fieldId);
    return this;
  }

  build(): FormSchema {
    return this.formSchema;
  }
}
```

---

## 3. Cấu trúc Component (Component Breakdown)

Chúng ta sẽ chia nhỏ các tính năng thành các Standalone Components quản lý State riêng bằng Angular Signals.

1. **`DynamicFormBuilderComponent`**: Trái tim của ứng dụng thiết kế, kết nối 3 vùng dưới đây lại.
2. **`ToolboxComponent`**: Sidebar chứa các thành phần có thể kéo thả (Text, Select, Date, v.v.).
3. **`CanvasComponent` (Drop Zone)**: Khu vực thả các control. Trực tiếp render UI nháp dựa trên FormSchema đang được thiết kế. Cung cấp chức năng chọn, di chuyển vị trí (sortable) hoặc xóa field.
4. **`PropertiesPanelComponent`**: Khi click vào 1 field trên Canvas, form settings tương ứng hiện ra tại đây để cấu hình (Label, Required, Options...).
5. **`DynamicFormRendererComponent`**: Dùng cho Client side. Nhận `@Input() schema: FormSchema` và tự động sinh ra FormGroup chứa các FormControls tương ứng (sử dụng Reactive Forms).

---

## 4. Lộ trình Triển khai (Step-by-Step Tasks)

Kế hoạch này được chia nhỏ thành các task cụ thể.

### Task 1: Xây dựng Lõi Schema & Builder
- [x] **Step 1:** Cài đặt package `uuid` và `@types/uuid` bằng npm.
- [x] **Step 2:** Tạo thư mục `core/models` và định nghĩa chi tiết các Interface / Types (`FieldSchema`, `FormSchema`).
- [x] **Step 3:** Xây dựng các class `FieldBuilder` và `FormSchemaBuilder` trong thư mục `core/builders`, sử dụng `uuidv4()` cho id.
- [x] **Step 4:** Viết Unit Test cơ bản để kiểm tra việc sinh ID và build schema.

### Task 2: Xây dựng Form Renderer (Hiển thị)
- [x] **Step 1:** Tạo component `DynamicFormRendererComponent`.
- [x] **Step 2:** Import `ReactiveFormsModule`, khởi tạo `FormGroup` từ `FormSchema` đầu vào.
- [x] **Step 3:** Thiết kế template: duyệt qua danh sách fields, sử dụng `ngSwitch` để render đúng input NG-ZORRO (nz-input, nz-select, v.v.).
- [x] **Step 4:** Mock một cấu hình JSON cố định, render thử form và kiểm tra hứng dữ liệu khi Submit.

### Task 3: Triển khai Drag & Drop Canvas (Form Builder Cơ bản)
- [x] **Step 1:** Cài đặt `@angular/cdk`.
- [x] **Step 2:** Tạo cấu trúc giao diện 3 cột với TailwindCSS gồm `ToolboxComponent`, `CanvasComponent`, `PropertiesPanelComponent`.
- [x] **Step 3:** Cấu hình `cdkDrag` ở Toolbox và `cdkDropList` ở Canvas.
- [x] **Step 4:** Bắt sự kiện drop. Khi thả 1 loại field từ Toolbox, dùng `FieldBuilder` tạo instance mới (với uuidv4) và đẩy vào Schema ở State.
- [x] **Step 5:** Cấu hình `cdkDrag` bên trong Canvas để cho phép Sortable (thay đổi thứ tự các field).

### Task 4: Xây dựng Properties Panel & Kết nối State
- [x] **Step 1:** Bắt sự kiện click vào field trên Canvas để đánh dấu "Active Field" trong Signal Store.
- [x] **Step 2:** `PropertiesPanelComponent` nhận "Active Field" và hiển thị form settings tương ứng (Ví dụ: Label, Placeholder, Required).
- [x] **Step 3:** Cập nhật State 2 chiều: Khi thay đổi cấu hình trên Properties Panel, apply ngược lại vào Schema trong Store để Canvas tự động re-render (Live Preview).

### Task 5: Mở rộng chức năng Field và Grid Layout
- [x] **Step 1:** Phát triển thêm các Field phức tạp: DatePicker, Checkbox Group, và Select động.
- [x] **Step 2:** Áp dụng Grid System của NG-ZORRO (`nz-row`, `nz-col`) dựa trên thuộc tính `gridSpan` của Schema để dàn layout ngang dọc.
- [x] **Step 3:** Thêm chức năng Export Schema ra JSON và nút Preview form.
