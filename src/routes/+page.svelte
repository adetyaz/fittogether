<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import { toast } from '$lib/stores/toast';
	import LocationMap from '$lib/components/LocationMap.svelte';

	let { data }: { data: PageData } = $props();

	const session = $derived($page.data.session);

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

	// Map locations with busy levels
	const mapLocations = $derived(
		data.locations.map((loc) => ({
			id: loc.id,
			name: loc.name,
			address: loc.address,
			latitude: loc.latitude,
			longitude: loc.longitude,
			busyLevel: loc.checkIns[0]?.busyLevel ?? null
		}))
	);

	// ── Place search state ──
	let searchQuery = $state('');
	let searchResults = $state<
		{
			nominatimId: number;
			name: string;
			displayName: string;
			latitude: number;
			longitude: number;
			type: string;
			address: string;
		}[]
	>([]);
	let searching = $state(false);
	let addingPlace = $state<number | null>(null);

	async function searchPlaces() {
		const q = searchQuery.trim();
		if (q.length < 2) return;
		searching = true;
		try {
			const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
			if (res.ok) {
				searchResults = await res.json();
			}
		} finally {
			searching = false;
		}
	}

	async function addPlace(place: (typeof searchResults)[0]) {
		addingPlace = place.nominatimId;
		try {
			const res = await fetch('/api/locations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: place.name,
					address: place.address || place.displayName,
					latitude: place.latitude,
					longitude: place.longitude,
					type: place.type
				})
			});
			if (res.ok) {
				searchQuery = '';
				searchResults = [];
				window.location.reload();
			} else {
				const err = await res.json();
				toast.error(err.message ?? 'Failed to add location');
			}
		} finally {
			addingPlace = null;
		}
	}

	// ── Check-in state ──
	let selectedLocation = $state<string | null>(null);
	let selectedLevel = $state<string>('Low');
	let checking = $state(false);

	async function checkIn() {
		if (!selectedLocation) return;
		if (!session) {
			toast.warning('Sign in to report busyness');
			return;
		}
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
				toast.error(err.message ?? 'Failed to check in');
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
	<p class="mb-6 text-gray-600">Real-time busyness reports from your community.</p>

	<!-- Map -->
	{#if mapLocations.some((l) => l.latitude != null)}
		<div class="mb-8">
			<LocationMap locations={mapLocations} onSelect={(id) => goto(`/locations/${id}`)} />
		</div>
	{/if}

	<!-- Add a place search -->
	<div class="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
		<h2 class="mb-3 text-lg font-semibold">Add a Pool or Gym</h2>
		<p class="mb-3 text-sm text-gray-500">
			Search by name — we'll pull the address and location automatically.
		</p>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="e.g. PureGym Shoreditch"
				class="flex-1 rounded-md border px-3 py-2 text-sm"
				onkeydown={(e) => e.key === 'Enter' && searchPlaces()}
			/>
			<button
				onclick={searchPlaces}
				disabled={searching || searchQuery.trim().length < 2}
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{searching ? 'Searching…' : 'Search'}
			</button>
		</div>

		{#if searchResults.length > 0}
			<ul class="mt-3 divide-y rounded-md border">
				{#each searchResults as place}
					<li class="flex items-center justify-between gap-3 px-4 py-3">
						<div class="min-w-0">
							<p class="truncate font-medium">{place.name}</p>
							<p class="truncate text-xs text-gray-500">{place.displayName}</p>
						</div>
						<button
							onclick={() => addPlace(place)}
							disabled={addingPlace === place.nominatimId}
							class="shrink-0 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
						>
							{addingPlace === place.nominatimId ? 'Adding…' : '+ Add'}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Location cards -->
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.locations as loc}
			{@const latest = loc.checkIns[0]}
			{@const config = latest ? (busyConfig[latest.busyLevel] ?? defaultConfig) : defaultConfig}
			<div
				class="rounded-xl border border-l-4 {config.border} {config.bg} p-5 shadow-sm transition hover:shadow-md"
			>
				<div class="mb-1 flex items-center justify-between">
					<a
						href="/locations/{loc.id}"
						class="text-lg font-semibold hover:text-blue-600 hover:underline">{loc.name}</a
					>
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

				{#if session}
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
				{:else}
					<button
						onclick={() => signIn('google')}
						class="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200"
					>
						🔒 Sign in to report
					</button>
				{/if}
			</div>
		{/each}
	</div>
</section>
