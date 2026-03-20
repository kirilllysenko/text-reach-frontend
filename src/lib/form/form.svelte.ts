import type { ZodType } from "zod";
import { forEach, forEachObj, fromKeys } from "remeda";

type FormValues = Record<string, any>;

type FormErrorKey<Values> = keyof Values | "general";
type FormErrors<Values extends FormValues> = {
  [K in FormErrorKey<Values>]: string | null;
};

type SubmitHandler<Values extends FormValues, Response> = (values: Values) => Promise<Response>;

export class Form<Values extends FormValues, Response = void> {
  errors: FormErrors<Values>;
  values: Values;
  loading: boolean;
  private readonly validator: ZodType<Values>;
  private readonly onSubmit: SubmitHandler<Values, Response>;

  constructor(initialValues: Values, validator: ZodType<Values>, onSubmit: SubmitHandler<Values, Response>) {
    const initialErrors = {
      ...fromKeys(Object.keys(initialValues), () => null),
      general: null,
    } as FormErrors<Values>;

    this.validator = validator;
    this.onSubmit = onSubmit;
    this.loading = $state(false);
    this.values = $state(initialValues);
    this.errors = $state(initialErrors);
  }

  clearErrors = (): void => {
    forEachObj(this.errors, (_, key) => {
      this.errors[key] = null;
    });
  };

  setErrors = (errors: Partial<FormErrors<Values>>): void => {
    this.clearErrors();
    for (const [key, error] of Object.entries(errors)) {
      if (error) {
        this.errors[key as FormErrorKey<Values>] = error;
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

      const key = String(fieldName);
      errors[key as FormErrorKey<Values>] = issue.message;
    }

    this.setErrors(errors);
    return false;
  };

  submit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    if (!this.validate()) {
      return;
    }

    this.loading = true;
    this.onSubmit(this.values)
      .then(response => {
        this.loading = false;
        this.setErrorsFromResponse(response);
      });
  };

  private setErrorsFromResponse = (response: any): void => {
    if (response.data && response.data.errorDescription) {
      this.errors.general = response.data.errorDescription;
    }
  };
}
