<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import { toast } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	const session = $derived($page.data.session);
	let joiningId = $state<string | null>(null);

	async function joinChallenge(id: string) {
		if (!session) {
			toast.warning('Sign in to join challenges');
			return;
		}
		joiningId = id;
		try {
			const res = await fetch(`/api/challenges/${id}/join`, { method: 'POST' });
			if (res.ok) {
				window.location.reload();
			} else {
				const err = await res.json();
				toast.error(err.message ?? 'Failed to join');
			}
		} finally {
			joiningId = null;
		}
	}
</script>

<svelte:head>
	<title>FitTogether – Challenges</title>
</svelte:head>

<section>
	<h1 class="mb-2 text-3xl font-bold">Challenges</h1>
	<p class="mb-8 text-gray-600">Push your limits. Compete with the community.</p>

	{#if data.challenges.length === 0}
		<p class="text-gray-500">No challenges yet. Check back soon!</p>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2">
			{#each data.challenges as ch}
				{@const joined = data.joinedIds.includes(ch.id)}
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<h2 class="mb-1 text-lg font-semibold">{ch.name}</h2>
					{#if ch.description}
						<p class="mb-3 text-sm text-gray-500">{ch.description}</p>
					{/if}

					<div class="mb-3 flex items-center gap-3 text-sm text-gray-600">
						<span>🎯 {ch.goalValue} {ch.unit}</span>
						<span>👥 {ch._count.entries} participants</span>
					</div>

					<div class="flex items-center gap-2">
						<a
							href="/challenges/{ch.id}"
							class="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
						>
							Leaderboard
						</a>

						{#if session}
							{#if joined}
								<span class="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
									✓ Joined
								</span>
							{:else}
								<button
									onclick={() => joinChallenge(ch.id)}
									disabled={joiningId === ch.id}
									class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
								>
									{joiningId === ch.id ? 'Joining…' : 'Join'}
								</button>
							{/if}
						{:else}
							<button
								onclick={() => signIn('google')}
								class="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200"
							>
								🔒 Sign in to join
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
