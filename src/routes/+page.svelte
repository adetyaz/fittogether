<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const busyConfig: Record<
		string,
		{ bg: string; badge: string; border: string; icon: string; label: string }
	> = {
		Low: {
			bg: 'bg-green-50',
			badge: 'bg-green-100 text-green-800',
			border: 'border-l-green-500',
			icon: '🟢',
			label: 'Not Busy'
		},
		Medium: {
			bg: 'bg-yellow-50',
			badge: 'bg-yellow-100 text-yellow-800',
			border: 'border-l-yellow-500',
			icon: '🟡',
			label: 'Getting Busy'
		},
		High: {
			bg: 'bg-red-50',
			badge: 'bg-red-100 text-red-800',
			border: 'border-l-red-500',
			icon: '🔴',
			label: 'Overcrowded!'
		}
	};

	const defaultConfig = {
		bg: 'bg-white',
		badge: 'bg-gray-100 text-gray-500',
		border: 'border-l-gray-300',
		icon: '⚪',
		label: 'No Data'
	};

	let selectedLocation = $state<string | null>(null);
	let selectedLevel = $state<string>('Low');
	let checking = $state(false);

	async function checkIn() {
		if (!selectedLocation) return;
		checking = true;
		try {
			const res = await fetch('/api/checkins', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ locationId: selectedLocation, busyLevel: selectedLevel })
			});
			if (res.ok) {
				window.location.reload();
			} else {
				const err = await res.json();
				alert(err.message ?? 'Failed to check in');
			}
		} finally {
			checking = false;
			selectedLocation = null;
		}
	}
</script>

<svelte:head>
	<title>FitTogether – How Busy Is It?</title>
</svelte:head>

<section>
	<h1 class="mb-2 text-3xl font-bold">How Busy Is It?</h1>
	<p class="mb-8 text-gray-600">Real-time busyness reports from your community.</p>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.locations as loc}
			{@const latest = loc.checkIns[0]}
			{@const config = latest ? (busyConfig[latest.busyLevel] ?? defaultConfig) : defaultConfig}
			<div
				class="rounded-xl border border-l-4 {config.border} {config.bg} p-5 shadow-sm transition hover:shadow-md"
			>
				<div class="mb-1 flex items-center justify-between">
					<h2 class="text-lg font-semibold">{loc.name}</h2>
					<span class="text-xl" title={config.label}>{config.icon}</span>
				</div>
				{#if loc.address}
					<p class="mb-3 text-sm text-gray-500">{loc.address}</p>
				{/if}

				{#if latest}
					<!-- Status badge + time -->
					<div class="mb-2 flex items-center gap-2">
						<span class="rounded-full px-3 py-0.5 text-xs font-semibold {config.badge}">
							{config.label}
						</span>
						<span class="text-xs text-gray-400">
							{new Date(latest.createdAt).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})}
						</span>
					</div>

					<!-- Overcrowded warning banner -->
					{#if latest.busyLevel === 'High'}
						<div
							class="mb-3 flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800"
						>
							<span>⚠️</span>
							<span>This spot is overcrowded right now — consider going later!</span>
						</div>
					{/if}

					<!-- Visual bar indicator -->
					<div class="mb-3">
						<div class="flex gap-1">
							<div
								class="h-2 flex-1 rounded-full {latest.busyLevel === 'Low' ||
								latest.busyLevel === 'Medium' ||
								latest.busyLevel === 'High'
									? 'bg-green-400'
									: 'bg-gray-200'}"
							></div>
							<div
								class="h-2 flex-1 rounded-full {latest.busyLevel === 'Medium' ||
								latest.busyLevel === 'High'
									? 'bg-yellow-400'
									: 'bg-gray-200'}"
							></div>
							<div
								class="h-2 flex-1 rounded-full {latest.busyLevel === 'High'
									? 'bg-red-400'
									: 'bg-gray-200'}"
							></div>
						</div>
					</div>
				{:else}
					<p class="mb-3 text-sm text-gray-400 italic">No reports yet — be the first!</p>
				{/if}

				{#if true}
					{#if selectedLocation === loc.id}
						<div class="flex items-center gap-2">
							<select bind:value={selectedLevel} class="rounded-md border px-2 py-1 text-sm">
								<option value="Low">🟢 Low</option>
								<option value="Medium">🟡 Medium</option>
								<option value="High">🔴 High</option>
							</select>
							<button
								onclick={checkIn}
								disabled={checking}
								class="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
							>
								{checking ? 'Sending…' : 'Submit'}
							</button>
							<button
								onclick={() => (selectedLocation = null)}
								class="text-sm text-gray-500 hover:text-gray-700"
							>
								Cancel
							</button>
						</div>
					{:else}
						<button
							onclick={() => (selectedLocation = loc.id)}
							class="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
						>
							📍 Report Status
						</button>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</section>
