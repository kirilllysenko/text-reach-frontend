<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import Button from '$lib/components/button/Button.svelte';
  import { checkSession } from '$lib/api/auth/auth';
  import { sendEmailCode, sendPhoneCode, signUp } from '$lib/api/sign-up/sign-up';
  import type { ErrorResponseDto } from '$lib/api/index.schemas';
  import {
    OTP_LENGTH,
    normalizePhoneNumber,
    validateEmailValue,
    validateExactLength,
    validatePasswordValue,
    validatePhoneNumberValue
  } from '$lib/auth/validators';

  interface FormErrors {
    email?: string;
    emailCode?: string;
    phoneNumber?: string;
    phoneNumberCode?: string;
    password?: string;
    general?: string;
  }

  let render = $state(false);

  let email = $state('');
  let emailCode = $state('');
  let phoneNumber = $state('');
  let phoneNumberCode = $state('');
  let password = $state('');

  let maskPassword = $state(true);

  let sendEmailCodeCountdown = $state(0);
  let sendPhoneCodeCountdown = $state(0);

  let signUpSpinner = $state(false);
  let emailCodeSpinner = $state(false);
  let phoneCodeSpinner = $state(false);

  let infoMessage = $state<string | undefined>(undefined);
  let errors = $state<FormErrors>({});

  let emailCountdownInterval: ReturnType<typeof setInterval> | undefined;
  let phoneCountdownInterval: ReturnType<typeof setInterval> | undefined;

  function startEmailCountdown(): void {
    sendEmailCodeCountdown = 60;

    if (emailCountdownInterval) {
      clearInterval(emailCountdownInterval);
    }

    emailCountdownInterval = setInterval(() => {
      if (sendEmailCodeCountdown > 0) {
        sendEmailCodeCountdown -= 1;
        return;
      }
      if (emailCountdownInterval) {
        clearInterval(emailCountdownInterval);
      }
    }, 1000);
  }

  function startPhoneCountdown(): void {
    sendPhoneCodeCountdown = 60;

    if (phoneCountdownInterval) {
      clearInterval(phoneCountdownInterval);
    }

    phoneCountdownInterval = setInterval(() => {
      if (sendPhoneCodeCountdown > 0) {
        sendPhoneCodeCountdown -= 1;
        return;
      }
      if (phoneCountdownInterval) {
        clearInterval(phoneCountdownInterval);
      }
    }, 1000);
  }

  function applyApiErrors(status: number, dto?: ErrorResponseDto): void {
    const nextErrors: FormErrors = {};

    if (status === 400 && dto?.fields) {
      for (const field of dto.fields) {
        if (!field?.field || !field.errorDescription) continue;
        if (
          field.field === 'email' ||
          field.field === 'emailCode' ||
          field.field === 'phoneNumber' ||
          field.field === 'phoneNumberCode' ||
          field.field === 'password'
        ) {
          nextErrors[field.field] = field.errorDescription;
        }
      }
    }

    if (dto?.errorDescription) {
      nextErrors.general = dto.errorDescription;
    } else if (status === 500) {
      nextErrors.general = 'Something went wrong. Please try again.';
    } else if (status === 404) {
      nextErrors.general = 'The changes could not be made because some data was not found. Please refresh the page.';
    }

    errors = nextErrors;
  }

  function validateSignUpForm(): boolean {
    const nextErrors: FormErrors = {};

    const emailError = validateEmailValue(email);
    if (emailError) nextErrors.email = emailError;

    const phoneError = validatePhoneNumberValue(phoneNumber);
    if (phoneError) nextErrors.phoneNumber = phoneError;

    const passwordError = validatePasswordValue(password);
    if (passwordError) nextErrors.password = passwordError;

    const emailCodeError = validateExactLength(emailCode, OTP_LENGTH);
    if (emailCodeError) nextErrors.emailCode = emailCodeError;

    const phoneCodeError = validateExactLength(phoneNumberCode, OTP_LENGTH);
    if (phoneCodeError) nextErrors.phoneNumberCode = phoneCodeError;

    errors = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    infoMessage = undefined;

    if (!validateSignUpForm()) return;

    signUpSpinner = true;
    try {
      const response = await signUp(
        {
          email,
          emailCode,
          phoneNumber: normalizePhoneNumber(phoneNumber),
          phoneNumberCode,
          password
        },
        { credentials: 'include' }
      );

      if (response.status === 200) {
        await goto('/sign-in?signUpOk=1');
        return;
      }

      applyApiErrors(response.status, response.data as ErrorResponseDto);
    } catch {
      errors = { general: 'Please check your internet connection and try again.' };
    } finally {
      signUpSpinner = false;
    }
  }

  async function sendEmailCodeClick(): Promise<void> {
    infoMessage = undefined;
    const emailError = validateEmailValue(email);

    errors = { ...errors, email: emailError, general: undefined };
    if (emailError) return;

    emailCodeSpinner = true;
    try {
      const response = await sendEmailCode({ email }, { credentials: 'include' });

      if (response.status === 200) {
        startEmailCountdown();
        infoMessage = 'The code has been sent to your email';
        return;
      }

      applyApiErrors(response.status, response.data as ErrorResponseDto);
    } catch {
      errors = { ...errors, general: 'Please check your internet connection and try again.' };
    } finally {
      emailCodeSpinner = false;
    }
  }

  async function sendPhoneCodeClick(): Promise<void> {
    infoMessage = undefined;
    const phoneError = validatePhoneNumberValue(phoneNumber);

    errors = { ...errors, phoneNumber: phoneError, general: undefined };
    if (phoneError) return;

    phoneCodeSpinner = true;
    try {
      const response = await sendPhoneCode(
        { phoneNumber: normalizePhoneNumber(phoneNumber) },
        { credentials: 'include' }
      );

      if (response.status === 200) {
        startPhoneCountdown();
        infoMessage = 'The code has been sent to your phone number';
        return;
      }

      applyApiErrors(response.status, response.data as ErrorResponseDto);
    } catch {
      errors = { ...errors, general: 'Please check your internet connection and try again.' };
    } finally {
      phoneCodeSpinner = false;
    }
  }

  onMount(async () => {
    try {
      const response = await checkSession({ credentials: 'include' });
      if (response.status === 200) {
        await goto('/');
        return;
      }
    } finally {
      render = true;
    }
  });

  onDestroy(() => {
    if (emailCountdownInterval) clearInterval(emailCountdownInterval);
    if (phoneCountdownInterval) clearInterval(phoneCountdownInterval);
  });
</script>

{#if render}
  <div
    class={
      `flex min-h-full flex-col justify-center p-2
      bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100`
    }
    inert={signUpSpinner || undefined}
  >
    <h1 class="mx-auto text-slate-800">Try our solution for free</h1>

    <div
      class={
        `mt-10 sm:mx-auto sm:w-md rounded-2xl border border-white/80
        bg-white/75 backdrop-blur-md shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
        p-4 sm:p-6`
      }
    >
      <form onsubmit={submit}>
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">E-mail</label>
          <input
            id="email"
            bind:value={email}
            type="email"
            autocomplete="email"
            class={[
              `mt-1 block w-full rounded-xl border bg-white/80 px-3 py-2 text-slate-700
              focus:outline-none focus:ring-2 focus:ring-sky-500/60`,
              errors.email ? 'border-rose-300' : 'border-white/80'
            ]}
            placeholder="you@example.com"
          />
          {#if errors.email}
            <p class="mt-1 text-sm text-rose-600">{errors.email}</p>
          {/if}
        </div>

        <div class="mt-4">
          <label for="phoneNumber" class="block text-sm font-medium text-slate-700">Phone number</label>
          <input
            id="phoneNumber"
            bind:value={phoneNumber}
            type="tel"
            autocomplete="tel"
            class={[
              `mt-1 block w-full rounded-xl border bg-white/80 px-3 py-2 text-slate-700
              focus:outline-none focus:ring-2 focus:ring-sky-500/60`,
              errors.phoneNumber ? 'border-rose-300' : 'border-white/80'
            ]}
            placeholder="(555) 123-4567"
          />
          {#if errors.phoneNumber}
            <p class="mt-1 text-sm text-rose-600">{errors.phoneNumber}</p>
          {/if}
        </div>

        <div class="mt-4">
          <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
          <div class="mt-1 relative">
            <input
              id="password"
              bind:value={password}
              type={maskPassword ? 'password' : 'text'}
              autocomplete="new-password"
              class={[
                `block w-full rounded-xl border bg-white/80 px-3 py-2 pr-20 text-slate-700
                focus:outline-none focus:ring-2 focus:ring-sky-500/60`,
                errors.password ? 'border-rose-300' : 'border-white/80'
              ]}
              placeholder="Create password"
            />
            <button
              type="button"
              onclick={() => (maskPassword = !maskPassword)}
              class={
                `absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm
                text-slate-600 hover:bg-slate-100`
              }
            >
              {maskPassword ? 'Show' : 'Hide'}
            </button>
          </div>
          {#if errors.password}
            <p class="mt-1 text-sm text-rose-600">{errors.password}</p>
          {/if}
        </div>

        <div class="mt-4">
          <label for="emailCode" class="block text-sm font-medium text-slate-700">E-mail confirmation code</label>
          <div class="mt-1 flex gap-2">
            <input
              id="emailCode"
              bind:value={emailCode}
              maxlength={OTP_LENGTH}
              class={[
                `block w-full rounded-xl border bg-white/80 px-3 py-2 text-slate-700
                focus:outline-none focus:ring-2 focus:ring-sky-500/60`,
                errors.emailCode ? 'border-rose-300' : 'border-white/80'
              ]}
            />
            <Button
              class="min-w-25"
              secondary
              small
              spinner={emailCodeSpinner}
              disabled={sendEmailCodeCountdown > 0}
              onclick={sendEmailCodeClick}
            >
              {sendEmailCodeCountdown === 0 ? 'Send code' : sendEmailCodeCountdown}
            </Button>
          </div>
          {#if errors.emailCode}
            <p class="mt-1 text-sm text-rose-600">{errors.emailCode}</p>
          {/if}
        </div>

        <div class="mt-4">
          <label for="phoneNumberCode" class="block text-sm font-medium text-slate-700">Phone number confirmation code</label>
          <div class="mt-1 flex gap-2">
            <input
              id="phoneNumberCode"
              bind:value={phoneNumberCode}
              maxlength={OTP_LENGTH}
              class={[
                `block w-full rounded-xl border bg-white/80 px-3 py-2 text-slate-700
                focus:outline-none focus:ring-2 focus:ring-sky-500/60`,
                errors.phoneNumberCode ? 'border-rose-300' : 'border-white/80'
              ]}
            />
            <Button
              class="min-w-25"
              secondary
              small
              spinner={phoneCodeSpinner}
              disabled={sendPhoneCodeCountdown > 0}
              onclick={sendPhoneCodeClick}
            >
              {sendPhoneCodeCountdown === 0 ? 'Send code' : sendPhoneCodeCountdown}
            </Button>
          </div>
          {#if errors.phoneNumberCode}
            <p class="mt-1 text-sm text-rose-600">{errors.phoneNumberCode}</p>
          {/if}
        </div>

        {#if infoMessage}
          <p class="mt-4 text-sm text-emerald-700">{infoMessage}</p>
        {/if}

        {#if errors.general}
          <p class="mt-4 text-sm text-rose-700">{errors.general}</p>
        {/if}

        <Button class="mt-5 w-full" submit spinner={signUpSpinner}>Sign up</Button>
      </form>

      <p class="mt-10 text-center text-sm text-slate-500">
        Already have an account?
        <a href="/sign-in">Sign in</a>
      </p>
    </div>
  </div>
{/if}
