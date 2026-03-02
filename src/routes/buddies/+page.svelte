<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import { toast } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	const session = $derived($page.data.session);

	let activity = $state('');
	let time = $state('');

	// Sync with server data on load / navigation
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

	const statusLabels: Record<string, { label: string; color: string }> = {
		at_gym: { label: '🏋️ At the gym', color: 'bg-green-100 text-green-800' },
		at_pool: { label: '🏊 At the pool', color: 'bg-blue-100 text-blue-800' }
	};

	let sendingTo = $state<string | null>(null);
	let respondingTo = $state<string | null>(null);

	async function sendBuddyRequest(toUserId: string) {
		if (!session) {
			toast.warning('Sign in to send buddy requests');
			return;
		}
		sendingTo = toUserId;
		try {
			const res = await fetch('/api/buddies/request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ toUserId })
			});
			if (res.ok) {
				await invalidateAll();
			} else {
				const err = await res.json();
				toast.error(err.message ?? 'Failed to send request');
			}
		} finally {
			sendingTo = null;
		}
	}

	async function respondToRequest(requestId: string, action: 'accept' | 'reject') {
		respondingTo = requestId;
		try {
			const res = await fetch(`/api/buddies/request/${requestId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action })
			});
			if (res.ok) {
				await invalidateAll();
			} else {
				const err = await res.json();
				toast.error(err.message ?? 'Failed to respond');
			}
		} finally {
			respondingTo = null;
		}
	}

	function openWhatsApp(phone: string | null) {
		if (!phone) {
			toast.info("This user hasn't added their WhatsApp number yet.");
			return;
		}
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
				{@const connection = data.buddyMap[buddy.id]}
				{@const isAccepted = connection?.status === 'accepted'}
				{@const isPending = connection?.status === 'pending'}
				{@const isIncomingPending = isPending && !connection?.isSender}
				{@const isOutgoingPending = isPending && connection?.isSender}
				{@const statusInfo = buddy.activeStatus ? statusLabels[buddy.activeStatus] : null}

				<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<div class="mb-3 flex items-center gap-3">
						{#if buddy.image}
							<div class="relative">
								<img src={buddy.image} alt={buddy.name ?? 'User'} class="h-12 w-12 rounded-full" />
								{#if statusInfo}
									<span
										class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"
										title={statusInfo.label}
									></span>
								{/if}
							</div>
						{:else}
							<div class="relative">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700"
								>
									{(buddy.name ?? '?')[0]}
								</div>
								{#if statusInfo}
									<span
										class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"
										title={statusInfo.label}
									></span>
								{/if}
							</div>
						{/if}
						<div>
							<h2 class="font-semibold">{buddy.name ?? 'Anonymous'}</h2>
							{#if buddy.bio}
								<p class="text-sm text-gray-500">{buddy.bio}</p>
							{/if}
						</div>
					</div>

					<!-- Active status badge -->
					{#if statusInfo}
						<div class="mb-3">
							<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {statusInfo.color}">
								{statusInfo.label}
							</span>
						</div>
					{:else}
						<div class="mb-3">
							<span
								class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500"
							>
								⚫ Offline
							</span>
						</div>
					{/if}

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

					<!-- Action buttons based on buddy status -->
					<div class="flex flex-wrap items-center gap-2">
						{#if isAccepted}
							<!-- Accepted: show WhatsApp if they're active -->
							{#if buddy.activeStatus}
								<button
									onclick={() => openWhatsApp(buddy.phone)}
									class="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"
								>
									💬 WhatsApp
								</button>
							{:else}
								<span class="text-xs text-gray-400 italic">
									Contact available when they're at the gym/pool
								</span>
							{/if}
							<span
								class="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
							>
								✓ Buddy
							</span>
						{:else if isOutgoingPending}
							<span
								class="rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700"
							>
								⏳ Request sent
							</span>
						{:else if isIncomingPending}
							<button
								onclick={() => respondToRequest(connection.requestId, 'accept')}
								disabled={respondingTo === connection.requestId}
								class="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
							>
								✓ Accept
							</button>
							<button
								onclick={() => respondToRequest(connection.requestId, 'reject')}
								disabled={respondingTo === connection.requestId}
								class="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
							>
								✗ Decline
							</button>
						{:else if session}
							<button
								onclick={() => sendBuddyRequest(buddy.id)}
								disabled={sendingTo === buddy.id}
								class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
							>
								{sendingTo === buddy.id ? 'Sending…' : '🤝 Send Buddy Request'}
							</button>
						{:else}
							<button
								onclick={() => signIn('google')}
								class="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200"
							>
								🔒 Sign in to connect
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
