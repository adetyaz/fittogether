<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let activity = $state(data.filters.activity ?? '');
	let time = $state(data.filters.time ?? '');

	// Re-sync when data changes (e.g. navigation)
	$effect(() => {
		activity = data.filters.activity ?? '';
		time = data.filters.time ?? '';
	});

	function applyFilters() {
		const params = new URLSearchParams();
		if (activity) params.set('activity', activity);
		if (time) params.set('time', time);
		goto(`/buddies?${params.toString()}`, { replaceState: true });
	}

	function sayHi(phone: string | null) {
		if (!phone) {
			alert("This user hasn't added their WhatsApp number yet.");
			return;
		}
		// Strip non-digit chars (keep leading +)
		const cleaned = phone.replace(/[^\d]/g, '');
		window.open(`https://wa.me/${cleaned}`, '_blank');
	}
</script>

<svelte:head>
	<title>FitTogether – Find a Buddy</title>
</svelte:head>

<section>
	<h1 class="mb-2 text-3xl font-bold">Find a Buddy</h1>
	<p class="mb-6 text-gray-600">Connect with swimmers and gym-goers near you.</p>

	<!-- Filters -->
	<div class="mb-8 flex flex-wrap items-end gap-4">
		<div>
			<label for="activity-filter" class="mb-1 block text-sm font-medium text-gray-700"
				>Activity</label
			>
			<select
				id="activity-filter"
				bind:value={activity}
				onchange={applyFilters}
				class="rounded-md border px-3 py-1.5 text-sm"
			>
				<option value="">All</option>
				<option value="swim">Swim</option>
				<option value="gym">Gym</option>
			</select>
		</div>
		<div>
			<label for="time-filter" class="mb-1 block text-sm font-medium text-gray-700"
				>Workout time</label
			>
			<select
				id="time-filter"
				bind:value={time}
				onchange={applyFilters}
				class="rounded-md border px-3 py-1.5 text-sm"
			>
				<option value="">All</option>
				<option value="morning">Morning</option>
				<option value="evening">Evening</option>
				<option value="weekend">Weekend</option>
			</select>
		</div>
	</div>

	{#if data.buddies.length === 0}
		<p class="text-gray-500">No buddies found. Try changing your filters.</p>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.buddies as buddy}
				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						{#if buddy.image}
							<img src={buddy.image} alt={buddy.name ?? 'User'} class="h-12 w-12 rounded-full" />
						{:else}
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700"
							>
								{(buddy.name ?? '?')[0]}
							</div>
						{/if}
						<div>
							<h2 class="font-semibold">{buddy.name ?? 'Anonymous'}</h2>
							{#if buddy.bio}
								<p class="text-sm text-gray-500">{buddy.bio}</p>
							{/if}
						</div>
					</div>

					<div class="mb-3 flex flex-wrap gap-1.5">
						{#each buddy.activities as act}
							<span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
								>{act}</span
							>
						{/each}
						{#each buddy.workoutTimes as wt}
							<span
								class="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
								>{wt}</span
							>
						{/each}
					</div>

					<button
						onclick={() => sayHi(buddy.phone)}
						class="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
					>
						💬 WhatsApp
					</button>
				</div>
			{/each}
		</div>
	{/if}
</section>
