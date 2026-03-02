<script lang="ts">
	import type { PageData } from './$types';
	import LocationMap from '$lib/components/LocationMap.svelte';

	let { data }: { data: PageData } = $props();

	const loc = $derived(data.location);
	const latest = $derived(loc.checkIns[0] ?? null);

	const busyConfig: Record<string, { color: string; label: string; icon: string }> = {
		Low: { color: 'text-green-600', label: 'Not Busy', icon: '🟢' },
		Medium: { color: 'text-yellow-600', label: 'Getting Busy', icon: '🟡' },
		High: { color: 'text-red-600', label: 'Overcrowded!', icon: '🔴' }
	};

	const typeLabels: Record<string, string> = {
		pool: '🏊 Swimming Pool',
		gym: '🏋️ Gym',
		leisure_centre: '🏢 Leisure Centre',
		sports_centre: '🏟️ Sports Centre'
	};

	// Check-in state
	let selectedLevel = $state<string>('Low');
	let checking = $state(false);

	async function checkIn() {
		checking = true;
		try {
			const res = await fetch('/api/checkins', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ locationId: loc.id, busyLevel: selectedLevel })
			});
			if (res.ok) {
				window.location.reload();
			} else {
				const err = await res.json();
				alert(err.message ?? 'Failed to check in');
			}
		} finally {
			checking = false;
		}
	}
</script>

<svelte:head>
	<title>{loc.name} – FitTogether</title>
</svelte:head>

<section class="space-y-8">
	<!-- Back link -->
	<a href="/" class="inline-block text-sm text-blue-600 hover:underline">← Back to all locations</a>

	<!-- Header -->
	<div>
		<div class="mb-1 flex items-center gap-3">
			<h1 class="text-3xl font-bold">{loc.name}</h1>
			{#if latest}
				{@const config = busyConfig[latest.busyLevel]}
				{#if config}
					<span class="text-2xl" title={config.label}>{config.icon}</span>
				{/if}
			{/if}
		</div>

		{#if loc.type}
			<p class="mb-1 text-sm font-medium text-gray-500">
				{typeLabels[loc.type] ?? loc.type}
			</p>
		{/if}

		{#if loc.address}
			<p class="text-gray-600">📍 {loc.address}</p>
		{/if}
	</div>

	<!-- Current status -->
	{#if latest}
		{@const config = busyConfig[latest.busyLevel]}
		<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="mb-2 text-lg font-semibold">Current Status</h2>
			<div class="flex items-center gap-3">
				<span class="text-3xl">{config?.icon ?? '⚪'}</span>
				<div>
					<p class="text-lg font-bold {config?.color ?? 'text-gray-600'}">
						{config?.label ?? latest.busyLevel}
					</p>
					<p class="text-sm text-gray-500">
						Last report: {new Date(latest.createdAt).toLocaleString([], {
							month: 'short',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}
						{#if latest.user?.name}
							by {latest.user.name}
						{/if}
					</p>
				</div>
			</div>
		</div>
	{:else}
		<div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
			<p class="text-gray-500">No busyness reports yet — be the first to check in!</p>
		</div>
	{/if}

	<!-- Map -->
	{#if loc.latitude != null && loc.longitude != null}
		<div>
			<h2 class="mb-3 text-lg font-semibold">Location</h2>
			<LocationMap
				locations={[
					{
						id: loc.id,
						name: loc.name,
						address: loc.address,
						latitude: loc.latitude,
						longitude: loc.longitude,
						busyLevel: latest?.busyLevel ?? null
					}
				]}
			/>
		</div>
	{/if}

	<!-- Check in -->
	<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
		<h2 class="mb-3 text-lg font-semibold">Report How Busy It Is</h2>
		<div class="flex items-center gap-3">
			<select bind:value={selectedLevel} class="rounded-md border px-3 py-2 text-sm">
				<option value="Low">🟢 Not Busy</option>
				<option value="Medium">🟡 Getting Busy</option>
				<option value="High">🔴 Overcrowded</option>
			</select>
			<button
				onclick={checkIn}
				disabled={checking}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{checking ? 'Sending…' : 'Submit Report'}
			</button>
		</div>
	</div>

	<!-- Recent reports -->
	{#if loc.checkIns.length > 0}
		<div>
			<h2 class="mb-3 text-lg font-semibold">Recent Reports</h2>
			<div class="space-y-2">
				{#each loc.checkIns as ci}
					{@const cfg = busyConfig[ci.busyLevel]}
					<div class="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
						<div class="flex items-center gap-3">
							{#if ci.user?.image}
								<img src={ci.user.image} alt="" class="h-8 w-8 rounded-full" />
							{:else}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500"
								>
									{(ci.user?.name ?? '?')[0]}
								</div>
							{/if}
							<div>
								<span class="text-sm font-medium">{ci.user?.name ?? 'Anonymous'}</span>
								<span class="ml-2 text-xs {cfg?.color ?? 'text-gray-600'}"
									>{cfg?.label ?? ci.busyLevel}</span
								>
							</div>
						</div>
						<span class="text-xs text-gray-400">
							{new Date(ci.createdAt).toLocaleString([], {
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>
