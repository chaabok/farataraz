import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DynamicForm } from './dynamic-form.entity';
export declare class DynamicFormRecord extends AppBaseEntity {
    dynamicFormRecordId: number;
    formRef: number;
    form: DynamicForm;
    data: any;
}
