<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children } = $props();

	const session = $derived($page.data.session);

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/buddies', label: 'Buddies' },
		{ href: '/challenges', label: 'Challenges' },
		{ href: '/profile', label: 'Profile' }
	];
</script>

<div class="flex min-h-screen flex-col bg-gray-50 text-gray-900">
	<!-- Navigation -->
	<header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
		<nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
			<a href="/" class="text-xl font-bold tracking-tight text-blue-600">FitTogether</a>

			<ul class="flex items-center gap-6 text-sm font-medium">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class="transition-colors hover:text-blue-600"
							class:text-blue-600={$page.url.pathname === link.href}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>

			<div>
				{#if session?.user}
					<div class="flex items-center gap-3">
						{#if session.user.image}
							<img
								src={session.user.image}
								alt={session.user.name ?? 'User'}
								class="h-8 w-8 rounded-full"
							/>
						{/if}
						<span class="hidden text-sm sm:inline">{session.user.name}</span>
						<button
							onclick={() => signOut()}
							class="rounded-md bg-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-300"
						>
							Sign out
						</button>
					</div>
				{:else}
					<button
						onclick={() => signIn('google')}
						class="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
					>
						Sign in with Google
					</button>
				{/if}
			</div>
		</nav>
	</header>

	<!-- Main content -->
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
		&copy; {new Date().getFullYear()} FitTogether. Built with SvelteKit.
	</footer>
</div>

<ToastContainer />
