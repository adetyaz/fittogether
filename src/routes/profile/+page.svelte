<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const activityOptions = ['swim', 'gym'];
	const timeOptions = ['morning', 'evening', 'weekend'];

	let activities = $state<string[]>(data.profile?.activities ?? []);
	let workoutTimes = $state<string[]>(data.profile?.workoutTimes ?? []);
	let phone = $state(data.profile?.phone ?? '');
	let bio = $state(data.profile?.bio ?? '');
	let saving = $state(false);
	let saved = $state(false);

	// Re-sync when data changes
	$effect(() => {
		activities = data.profile?.activities ?? [];
		workoutTimes = data.profile?.workoutTimes ?? [];
		phone = data.profile?.phone ?? '';
		bio = data.profile?.bio ?? '';
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
