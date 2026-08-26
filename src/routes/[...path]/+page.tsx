import { Title } from "@solidjs/meta";

export default function NotFoundPage() {
  return (
    <main class="flex min-h-dvh items-center justify-center p-6">
      <Title>Page not found | Text Reach</Title>
      <div class="glass-card max-w-lg p-6 text-center">
        <h1>Page not found</h1>
        <p class="mt-2 text-sm text-slate-600">The requested page does not exist.</p>
        <a class="mt-4 inline-block" href="/sign-in">
          Return to sign in
        </a>
      </div>
    </main>
  );
}
