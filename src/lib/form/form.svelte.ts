import type {ErrorResponseDto} from '$lib/api/index.schemas';
import type {ZodType} from 'zod';

type FormValues = Record<string, any>;
type FormErrors<Values extends FormValues> = Record<keyof Values, string | null>;

export class Form<Values extends FormValues> {
    [key: string]: any;

    errors: FormErrors<Values>;
    values: Values;
    private readonly validator: ZodType<Values>;

    constructor(
        initialValues: Values,
        validator: ZodType<Values>
    ) {
        this.validator = validator;
        this.values = $state({...initialValues});
        this.errors = $state({} as FormErrors<Values>);
    }

    clearErrors = (): void => {
        for (const key in this.errors) {
            this.errors[key] = null;
        }
    };

    setErrors = (errors: FormErrors<Values>): void => {
        this.clearErrors();
        for (const [key, error] of Object.entries(errors) as [keyof Values, string | null][]) {
            if (error) {
                this.errors[key] = error;
            }
        }
    };

    validate = (): boolean => {
        const result = this.validator.safeParse(this.values);
        if (result.success) {
            this.clearErrors();
            return true;
        }

        const errors = {} as FormErrors<Values>;

        for (const issue of result.error.issues) {
            const [fieldName] = issue.path;

            const key = fieldName as keyof Values;
            errors[key] = issue.message;
        }

        this.setErrors(errors);
        return false;
    };

    private errorsFromResponseDto = (dto: ErrorResponseDto): FormErrors<Values> => {
        const nextErrors = {} as FormErrors<Values>;

        for (const fieldError of dto.fields ?? []) {
            const key = fieldError.field as keyof Values;
            if (this.fieldNames.has(key) && !nextErrors[key]) {
                nextErrors[key] = fieldError.errorDescription;
            }
        }

        return nextErrors;
    };
}
