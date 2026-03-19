<script lang="ts">
	const chats = [
		{ id: 1, name: 'Alex Johnson', lastMessage: 'Can we ship this tonight?', time: '2m', unread: 2 },
		{ id: 2, name: 'Design Team', lastMessage: 'Uploaded new mobile mockups', time: '11m', unread: 0 },
		{ id: 3, name: 'Support Queue', lastMessage: '3 new customer conversations', time: '27m', unread: 3 }
	];

	const messages = [
		{ id: 1, fromMe: false, text: 'Hey, is the mobile chat build ready for testing?', time: '10:21' },
		{ id: 2, fromMe: true, text: 'Almost. I finished routing and UI shell.', time: '10:22' },
		{ id: 3, fromMe: false, text: 'Perfect. Please share it after lunch.', time: '10:23' },
		{ id: 4, fromMe: true, text: 'Will do. Next step is API integration.', time: '10:24' }
	];
</script>

<main class="mx-auto flex min-h-svh w-full max-w-5xl flex-col p-3 md:p-6">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">Texting App</h1>
			<p class="text-sm text-slate-600">Single-page SvelteKit + Tailwind + daisyUI starter</p>
		</div>
		<button class="btn btn-sm btn-primary">New Chat</button>
	</div>

	<div class="grid flex-1 gap-3 md:grid-cols-[320px_1fr]">
		<section class="card bg-base-100/95 border border-base-300 shadow-sm backdrop-blur">
			<div class="card-body gap-2 p-3">
				<label class="input input-bordered input-sm flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.3-4.3"></path>
					</svg>
					<input type="text" class="grow" placeholder="Search chats" />
				</label>

				<div class="mt-1 space-y-2">
					{#each chats as chat}
						<button class="btn btn-ghost h-auto w-full justify-start px-2 py-3 normal-case">
							<div class="flex w-full items-center gap-3">
								<div class="avatar placeholder">
									<div class="bg-primary text-primary-content w-10 rounded-full">
										<span>{chat.name[0]}</span>
									</div>
								</div>
								<div class="min-w-0 flex-1 text-left">
									<div class="flex items-center justify-between gap-2">
										<p class="truncate font-semibold">{chat.name}</p>
										<span class="text-xs text-base-content/60">{chat.time}</span>
									</div>
									<p class="truncate text-xs text-base-content/65">{chat.lastMessage}</p>
								</div>
								{#if chat.unread > 0}
									<div class="badge badge-primary badge-sm">{chat.unread}</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		</section>

		<section class="card bg-base-100/95 border border-base-300 shadow-sm backdrop-blur">
			<div class="card-body p-0">
				<div class="border-b border-base-300 px-4 py-3">
					<p class="font-semibold">Alex Johnson</p>
					<p class="text-xs text-base-content/60">Online now</p>
				</div>

				<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
					{#each messages as message}
						<div class="chat {message.fromMe ? 'chat-end' : 'chat-start'}">
							<div class="chat-bubble {message.fromMe ? 'chat-bubble-primary' : ''}">{message.text}</div>
							<div class="chat-footer mt-1 text-[10px] text-base-content/60">{message.time}</div>
						</div>
					{/each}
				</div>

				<div class="border-t border-base-300 p-3">
					<div class="join w-full">
						<input class="input input-bordered join-item w-full" placeholder="Write a message..." />
						<button class="btn btn-primary join-item">Send</button>
					</div>
				</div>
			</div>
		</section>
	</div>
</main>
