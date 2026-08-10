import type { ZodType } from "zod";
import { forEachObj } from "remeda";

type FormValues = Record<string, any>;
type FormErrorKey<Values> = keyof Values | "general";
type SubmitHandler<Values> = (values: Values) => Promise<FormSubmitResult>;

export interface FormSubmitResult {
  error?: string;
}

const formFieldSymbol = Symbol("form-field");
const reservedKeys = new Set([
  "clearErrors",
  "generalError",
  "loading",
  "setErrors",
  "setValues",
  "submit",
  "toValues",
  "validate",
]);

export type FormField<Value> = {
  value: Value;
  error: string | null;
};

type InternalFormField<Value> = FormField<Value> & {
  [formFieldSymbol]: true;
};

export type FormShape<Value> = Value extends unknown[]
  ? FormField<Value>
  : Value extends FormValues
    ? { [Key in keyof Value]: FormShape<Value[Key]> }
    : FormField<Value>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFormField(value: unknown): value is InternalFormField<unknown> {
  return isPlainObject(value) && formFieldSymbol in value;
}

function createField<Value>(value: Value): FormShape<Value> {
  if (isPlainObject(value)) {
    const entries = Object.entries(value).map(([key, item]) => [key, createField(item)]);
    return Object.fromEntries(entries) as FormShape<Value>;
  }

  const field = {
    value,
    error: null,
  } as InternalFormField<Value>;

  Object.defineProperty(field, formFieldSymbol, {
    value: true,
  });

  return field as unknown as FormShape<Value>;
}

function clearShapeErrors(shape: unknown): void {
  if (isFormField(shape)) {
    shape.error = null;
    clearShapeErrors(shape.value);
    return;
  }

  if (Array.isArray(shape)) {
    for (const item of shape) {
      clearShapeErrors(item);
    }

    return;
  }

  if (isPlainObject(shape)) {
    forEachObj(shape, (value) => {
      clearShapeErrors(value);
    });
  }
}

function setShapeValues(shape: unknown, value: unknown): void {
  if (isFormField(shape)) {
    shape.value = value;
    shape.error = null;
    return;
  }

  if (!isPlainObject(shape) || !isPlainObject(value)) {
    return;
  }

  for (const key of Object.keys(shape)) {
    if (!(key in value)) {
      delete shape[key];
    }
  }

  for (const [key, item] of Object.entries(value)) {
    const field = shape[key];

    if (field === undefined) {
      shape[key] = createField(item);
      continue;
    }

    setShapeValues(field, item);
  }
}

export function setFormShapeValue<Value>(shape: FormShape<Value>, value: Value): void {
  setShapeValues(shape, value);
}

function extractValues<Value>(shape: FormShape<Value>): Value {
  if (isFormField(shape)) {
    return shape.value as Value;
  }

  const entries = Object.entries(shape).map(([key, value]) => [key, extractValues(value as never)]);
  return Object.fromEntries(entries) as Value;
}

function getNodeAtPath(shape: unknown, path: Array<string | number>): unknown {
  let current = shape;

  for (const segment of path) {
    if (current == null) {
      return null;
    }

    current = (current as Record<string | number, unknown>)[segment];
  }

  return current;
}

class FormController<Values extends FormValues, ParsedValues = Values> {
  error: string | null;
  loading: boolean;
  private readonly fields: FormShape<Values>;
  private readonly validator: ZodType<ParsedValues, Values>;
  private readonly onSubmit: SubmitHandler<ParsedValues>;

  constructor(initialValues: Values, validator: ZodType<ParsedValues, Values>, onSubmit: SubmitHandler<ParsedValues>) {
    for (const key of Object.keys(initialValues)) {
      if (reservedKeys.has(key)) {
        throw new Error(`Form field name "${key}" conflicts with a reserved Form property.`);
      }
    }

    this.validator = validator;
    this.onSubmit = onSubmit;
    this.loading = $state(false);
    this.error = $state(null);
    this.fields = $state(createField(initialValues));

    Object.assign(this, this.fields);
  }

  clearErrors = (): void => {
    this.error = null;
    clearShapeErrors(this.fields);
  };

  setErrors = (errors: Partial<Record<FormErrorKey<Values>, string | null>>): void => {
    this.clearErrors();

    for (const [key, error] of Object.entries(errors)) {
      if (!error) {
        continue;
      }

      if (key === "general") {
        this.error = error;
        continue;
      }

      const field = getNodeAtPath(this.fields, [key]);
      if (isFormField(field)) {
        field.error = error;
      }
    }
  };

  setValues = (values: Values): void => {
    setShapeValues(this.fields, values);
    this.clearErrors();
  };

  toValues = (): Values => {
    return extractValues(this.fields);
  };

  validate = (): boolean => {
    return this.parseValues(this.toValues()).success;
  };

  submit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    const result = this.parseValues(this.toValues());
    if (!result.success) {
      return;
    }

    this.loading = true;

    try {
      const response = await this.onSubmit(result.data);
      this.error = response.error ?? null;
    } finally {
      this.loading = false;
    }
  };

  private parseValues = (values: Values): { success: true; data: ParsedValues } | { success: false } => {
    const result = this.validator.safeParse(values);

    if (result.success) {
      this.clearErrors();
      return result;
    }

    this.clearErrors();

    for (const issue of result.error.issues) {
      if (issue.path.length === 0) {
        this.error = issue.message;
        continue;
      }

      const field = getNodeAtPath(this.fields, issue.path as Array<string | number>);
      if (isFormField(field)) {
        field.error = issue.message;
      }
    }

    return { success: false };
  };
}

export type Form<Values extends FormValues, ParsedValues = Values> = FormController<Values, ParsedValues> &
  FormShape<Values>;

export function createForm<Values extends FormValues, ParsedValues = Values>(
  initialValues: Values,
  validator: ZodType<ParsedValues, Values>,
  onSubmit: SubmitHandler<ParsedValues>,
): Form<Values, ParsedValues> {
  return new FormController(initialValues, validator, onSubmit) as Form<Values, ParsedValues>;
}
