<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const activityOptions = ['swim', 'gym'];
	const timeOptions = ['morning', 'evening', 'weekend'];

	let activities = $state<string[]>([]);
	let workoutTimes = $state<string[]>([]);
	let phone = $state('');
	let bio = $state('');
	let saving = $state(false);
	let saved = $state(false);
	let activeStatus = $state<string | null>(null);
	let togglingStatus = $state(false);
	let respondingTo = $state<string | null>(null);

	// Sync with server data on load / navigation
	$effect(() => {
		activities = data.profile?.activities ?? [];
		workoutTimes = data.profile?.workoutTimes ?? [];
		phone = data.profile?.phone ?? '';
		bio = data.profile?.bio ?? '';
		activeStatus = data.profile?.activeStatus ?? null;
	});

	function toggleItem(arr: string[], item: string): string[] {
		return arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item];
	}

	async function saveProfile() {
		if (!data.profile) return;
		saving = true;
		saved = false;
		try {
			const res = await fetch(`/api/users/${data.profile.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ activities, workoutTimes, phone, bio })
			});
			if (res.ok) {
				saved = true;
				setTimeout(() => (saved = false), 2000);
			} else {
				const err = await res.json();
				alert(err.message ?? 'Failed to save');
			}
		} finally {
			saving = false;
		}
	}

	async function setStatus(status: string | null) {
		togglingStatus = true;
		try {
			const res = await fetch('/api/users/status', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});
			if (res.ok) {
				activeStatus = status;
			} else {
				const err = await res.json();
				alert(err.message ?? 'Failed to update status');
			}
		} finally {
			togglingStatus = false;
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
				alert(err.message ?? 'Failed to respond');
			}
		} finally {
			respondingTo = null;
		}
	}
</script>

<svelte:head>
	<title>Your Profile – FitTogether</title>
</svelte:head>

{#if data.profile}
	<section class="space-y-10">
		<!-- Header -->
		<div class="flex items-center gap-4">
			{#if data.profile.image}
				<img
					src={data.profile.image}
					alt={data.profile.name ?? ''}
					class="h-16 w-16 rounded-full"
				/>
			{/if}
			<div>
				<h1 class="text-2xl font-bold">{data.profile.name ?? 'Anonymous'}</h1>
				<p class="text-sm text-gray-500">{data.profile.email}</p>
			</div>
		</div>

		<!-- Active Status Toggle -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-2 text-lg font-semibold">Your Status</h2>
			<p class="mb-4 text-sm text-gray-500">
				Set your status so buddies know when you're available to connect. Your WhatsApp number is
				only visible to accepted buddies while you're active.
			</p>
			<div class="flex flex-wrap gap-3">
				<button
					onclick={() => setStatus(activeStatus === 'at_gym' ? null : 'at_gym')}
					disabled={togglingStatus}
					class="rounded-full border-2 px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
					class:bg-green-600={activeStatus === 'at_gym'}
					class:text-white={activeStatus === 'at_gym'}
					class:border-green-600={activeStatus === 'at_gym'}
					class:border-gray-300={activeStatus !== 'at_gym'}
				>
					🏋️ At the Gym
				</button>
				<button
					onclick={() => setStatus(activeStatus === 'at_pool' ? null : 'at_pool')}
					disabled={togglingStatus}
					class="rounded-full border-2 px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
					class:bg-blue-600={activeStatus === 'at_pool'}
					class:text-white={activeStatus === 'at_pool'}
					class:border-blue-600={activeStatus === 'at_pool'}
					class:border-gray-300={activeStatus !== 'at_pool'}
				>
					🏊 At the Pool
				</button>
				{#if activeStatus}
					<button
						onclick={() => setStatus(null)}
						disabled={togglingStatus}
						class="rounded-full border-2 border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
					>
						⚫ Go Offline
					</button>
				{/if}
			</div>
			{#if activeStatus}
				<p class="mt-3 text-sm text-green-700">
					✓ You're visible as <strong
						>{activeStatus === 'at_gym' ? 'At the Gym' : 'At the Pool'}</strong
					>. Accepted buddies can contact you.
				</p>
			{:else}
				<p class="mt-3 text-sm text-gray-400">
					You're currently offline. Buddies can't contact you via WhatsApp right now.
				</p>
			{/if}
		</div>

		<!-- Incoming Buddy Requests -->
		{#if data.incomingRequests && data.incomingRequests.length > 0}
			<div class="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">
					Buddy Requests
					<span
						class="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900"
					>
						{data.incomingRequests.length}
					</span>
				</h2>
				<div class="space-y-3">
					{#each data.incomingRequests as req}
						<div class="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
							<div class="flex items-center gap-3">
								{#if req.fromUser.image}
									<img
										src={req.fromUser.image}
										alt={req.fromUser.name ?? 'User'}
										class="h-10 w-10 rounded-full"
									/>
								{:else}
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700"
									>
										{(req.fromUser.name ?? '?')[0]}
									</div>
								{/if}
								<div>
									<p class="font-medium">{req.fromUser.name ?? 'Anonymous'}</p>
									{#if req.fromUser.activities.length > 0}
										<p class="text-xs text-gray-500">{req.fromUser.activities.join(', ')}</p>
									{/if}
								</div>
							</div>
							<div class="flex gap-2">
								<button
									onclick={() => respondToRequest(req.id, 'accept')}
									disabled={respondingTo === req.id}
									class="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
								>
									✓ Accept
								</button>
								<button
									onclick={() => respondToRequest(req.id, 'reject')}
									disabled={respondingTo === req.id}
									class="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
								>
									✗ Decline
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Edit profile -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold">Edit Profile</h2>

			<div class="mb-4">
				<span class="mb-1 block text-sm font-medium text-gray-700">Activities</span>
				<div class="flex gap-2">
					{#each activityOptions as opt}
						<button
							onclick={() => (activities = toggleItem(activities, opt))}
							class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
							class:bg-blue-600={activities.includes(opt)}
							class:text-white={activities.includes(opt)}
							class:border-blue-600={activities.includes(opt)}
						>
							{opt}
						</button>
					{/each}
				</div>
			</div>

			<div class="mb-4">
				<span class="mb-1 block text-sm font-medium text-gray-700">Workout times</span>
				<div class="flex gap-2">
					{#each timeOptions as opt}
						<button
							onclick={() => (workoutTimes = toggleItem(workoutTimes, opt))}
							class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
							class:bg-purple-600={workoutTimes.includes(opt)}
							class:text-white={workoutTimes.includes(opt)}
							class:border-purple-600={workoutTimes.includes(opt)}
						>
							{opt}
						</button>
					{/each}
				</div>
			</div>

			<div class="mb-4">
				<label for="phone" class="mb-1 block text-sm font-medium text-gray-700"
					>WhatsApp Number</label
				>
				<input
					id="phone"
					type="tel"
					bind:value={phone}
					class="w-full rounded-md border px-3 py-2 text-sm"
					placeholder="+447123456789"
				/>
				<p class="mt-1 text-xs text-gray-400">
					Other users will contact you via WhatsApp with this number.
				</p>
			</div>

			<div class="mb-4">
				<label for="bio" class="mb-1 block text-sm font-medium text-gray-700">Bio</label>
				<textarea
					id="bio"
					bind:value={bio}
					rows={3}
					class="w-full rounded-md border px-3 py-2 text-sm"
					placeholder="Tell others about yourself…"
				></textarea>
			</div>

			<button
				onclick={saveProfile}
				disabled={saving}
				class="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save'}
			</button>
		</div>

		<!-- Check-in history -->
		<div>
			<h2 class="mb-4 text-lg font-semibold">Recent Check-ins</h2>
			{#if data.profile.checkIns.length === 0}
				<p class="text-gray-500">No check-ins yet.</p>
			{:else}
				<div class="space-y-2">
					{#each data.profile.checkIns as ci}
						<div class="flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
							<span class="font-medium">{ci.location.name}</span>
							<span class="text-sm text-gray-500">{ci.busyLevel}</span>
							<span class="text-xs text-gray-400">
								{new Date(ci.createdAt).toLocaleDateString()}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Joined challenges -->
		<div>
			<h2 class="mb-4 text-lg font-semibold">Joined Challenges</h2>
			{#if data.profile.challengeEntries.length === 0}
				<p class="text-gray-500">You haven't joined any challenges yet.</p>
			{:else}
				<div class="space-y-3">
					{#each data.profile.challengeEntries as entry}
						{@const pct = Math.min(100, (entry.progress / entry.challenge.goalValue) * 100)}
						<a
							href="/challenges/{entry.challengeId}"
							class="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
						>
							<div class="mb-1 flex items-center justify-between">
								<span class="font-medium">{entry.challenge.name}</span>
								<span class="text-sm text-gray-600"
									>{entry.progress} / {entry.challenge.goalValue} {entry.challenge.unit}</span
								>
							</div>
							<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
								<div class="h-full rounded-full bg-blue-500" style="width: {pct}%"></div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
