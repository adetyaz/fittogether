<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import { toast } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	const session = $derived($page.data.session);
	let logValue = $state(1);
	let logging = $state(false);

	async function logWorkout() {
		if (logValue <= 0) return;
		if (!session) {
			toast.warning('Sign in to log workouts');
			return;
		}
		logging = true;
		try {
			const res = await fetch(`/api/challenges/${data.challenge.id}/log`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ value: logValue })
			});
			if (res.ok) {
				window.location.reload();
			} else {
				const err = await res.json();
				toast.error(err.message ?? 'Failed to log workout');
			}
		} finally {
			logging = false;
		}
	}

	function progressPercent(progress: number): number {
		return Math.min(100, (progress / data.challenge.goalValue) * 100);
	}
</script>

<svelte:head>
	<title>{data.challenge.name} – FitTogether</title>
</svelte:head>

<section>
	<a href="/challenges" class="mb-4 inline-block text-sm text-blue-600 hover:underline"
		>← All Challenges</a
	>

	<h1 class="mb-1 text-3xl font-bold">{data.challenge.name}</h1>
	{#if data.challenge.description}
		<p class="mb-2 text-gray-600">{data.challenge.description}</p>
	{/if}
	<p class="mb-8 text-sm text-gray-500">
		Goal: {data.challenge.goalValue}
		{data.challenge.unit} ({data.challenge.goalType})
	</p>

	<!-- My progress + log workout -->
	{#if data.myEntry}
		<div class="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
			<h2 class="mb-2 text-lg font-semibold text-blue-900">Your Progress</h2>
			<div class="mb-2 h-4 w-full overflow-hidden rounded-full bg-blue-200">
				<div
					class="h-full rounded-full bg-blue-600 transition-all"
					style="width: {progressPercent(data.myEntry.progress)}%"
				></div>
			</div>
			<p class="mb-4 text-sm text-blue-800">
				{data.myEntry.progress} / {data.challenge.goalValue}
				{data.challenge.unit}
				({progressPercent(data.myEntry.progress).toFixed(0)}%)
			</p>

			<div class="flex items-center gap-2">
				<input
					type="number"
					min="0.1"
					step="0.1"
					bind:value={logValue}
					class="w-24 rounded-md border px-2 py-1 text-sm"
				/>
				<span class="text-sm text-gray-600">{data.challenge.unit}</span>
				<button
					onclick={logWorkout}
					disabled={logging}
					class="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{logging ? 'Logging…' : 'Log Workout'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Leaderboard -->
	<h2 class="mb-4 text-xl font-semibold">Leaderboard</h2>
	{#if data.leaderboard.length === 0}
		<p class="text-gray-500">No one has joined yet. Be the first!</p>
	{:else}
		<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
						<th class="w-12 px-4 py-3">#</th>
						<th class="px-4 py-3">User</th>
						<th class="px-4 py-3 text-right">Progress</th>
						<th class="w-40 px-4 py-3"></th>
					</tr>
				</thead>
				<tbody>
					{#each data.leaderboard as entry, i}
						<tr
							class="border-b last:border-0"
							class:bg-blue-50={entry.userId === data.myEntry?.userId}
						>
							<td class="px-4 py-3 font-bold text-gray-400">{i + 1}</td>
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									{#if entry.user.image}
										<img src={entry.user.image} alt="" class="h-7 w-7 rounded-full" />
									{/if}
									<span class="font-medium">{entry.user.name ?? 'Anonymous'}</span>
								</div>
							</td>
							<td class="px-4 py-3 text-right font-semibold">
								{entry.progress}
								{data.challenge.unit}
							</td>
							<td class="px-4 py-3">
								<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
									<div
										class="h-full rounded-full bg-blue-500"
										style="width: {progressPercent(entry.progress)}%"
									></div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
