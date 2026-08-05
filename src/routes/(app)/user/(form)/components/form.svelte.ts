import { goto } from "$app/navigation";
import { CreateUserStore, UpdateUserStore, cache } from "$houdini";
import { PATH_USER } from "$lib/app/paths";
import { networkErrorText } from "$lib/form/errors";
import { createForm } from "$lib/form/form.svelte";
import { PasswordSchema } from "$lib/form/validators";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { userRoleOptions, type UserDtoLike } from "$lib/feature/user/user-view-data";
import { z } from "zod";

export type FormMode = "create" | "edit";

type UserSubmitResponse = Record<string, never> | ErrorSubmitResponse;

type ErrorSubmitResponse = {
  data: {
    errorDescription: string;
  };
  status: 0;
};

const formSchema = z.object({
  email: z.string(),
  name: z.string().max(50, "Name must be 50 characters or fewer"),
  password: z.string(),
  role: z.enum(userRoleOptions),
});

export type FormValues = z.infer<typeof formSchema>;

const initialValues: FormValues = {
  email: "",
  name: "",
  password: "",
  role: "EMPLOYEE",
};

interface UserFormOptions {
  id?: string;
  mode: FormMode;
}

export function createUserForm(options: UserFormOptions) {
  const createUserMutation = new CreateUserStore();
  const updateUserMutation = new UpdateUserStore();
  const validator = formSchema.superRefine((values, context) => {
    if (options.mode !== "create") {
      return;
    }

    const email = z.email("Enter a valid email address").safeParse(values.email.trim());
    if (!email.success) {
      context.addIssue({ code: "custom", message: email.error.issues[0]?.message ?? "Required", path: ["email"] });
    }

    const password = PasswordSchema.safeParse(values.password);
    if (!password.success) {
      context.addIssue({
        code: "custom",
        message: password.error.issues[0]?.message ?? "Required",
        path: ["password"],
      });
    }
  });

  const form = createForm<FormValues, UserSubmitResponse>(initialValues, validator, submit);

  function setUser(user: UserDtoLike): void {
    form.setValues({
      email: user.email,
      name: user.name ?? "",
      password: "",
      role: user.role,
    });
  }

  function serializeEditableValues(): string {
    const values = form.toValues();
    return JSON.stringify({ name: values.name.trim(), role: values.role });
  }

  async function submit(values: FormValues): Promise<UserSubmitResponse> {
    try {
      if (options.mode === "create") {
        const response = await createUserMutation.mutate({
          input: {
            email: values.email.trim(),
            name: optionalText(values.name),
            password: values.password,
            role: values.role,
          },
        });

        if (response.errors || !response.data?.createUser) {
          return formErrorResponse(toGraphQLErrorText(response.errors));
        }
      } else {
        if (!options.id) {
          return formErrorResponse("User was not found.");
        }

        const response = await updateUserMutation.mutate({
          input: {
            id: options.id,
            name: optionalText(values.name),
            role: values.role,
          },
        });

        if (response.errors || !response.data?.updateUser) {
          return formErrorResponse(toGraphQLErrorText(response.errors));
        }
      }

      cache.markStale("TenantUserConnection");
      notificationsState.showInfo(options.mode === "create" ? "User has been created" : "User has been updated");
      await goto(PATH_USER);
      return {};
    } catch {
      return formErrorResponse(networkErrorText);
    }
  }

  return { form, serializeEditableValues, setUser };
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function formErrorResponse(errorDescription: string): ErrorSubmitResponse {
  return {
    data: { errorDescription },
    status: 0,
  };
}
