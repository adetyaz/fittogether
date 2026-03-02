<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { fly, fade } from 'svelte/transition';

	const typeStyles: Record<string, { bg: string; icon: string; border: string }> = {
		success: { bg: 'bg-green-50', icon: '✓', border: 'border-green-400' },
		error: { bg: 'bg-red-50', icon: '✗', border: 'border-red-400' },
		info: { bg: 'bg-blue-50', icon: 'ℹ', border: 'border-blue-400' },
		warning: { bg: 'bg-yellow-50', icon: '⚠', border: 'border-yellow-400' }
	};

	const textStyles: Record<string, string> = {
		success: 'text-green-800',
		error: 'text-red-800',
		info: 'text-blue-800',
		warning: 'text-yellow-800'
	};
</script>

{#if $toast.length > 0}
	<div class="fixed right-4 bottom-4 z-9999 flex flex-col gap-2">
		{#each $toast as t (t.id)}
			<div
				role="alert"
				class="flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 shadow-lg {typeStyles[t.type]
					.bg} {typeStyles[t.type].border}"
				in:fly={{ x: 100, duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				<span class="text-lg font-bold {textStyles[t.type]}">{typeStyles[t.type].icon}</span>
				<span class="text-sm font-medium {textStyles[t.type]}">{t.message}</span>
				<button
					onclick={() => toast.remove(t.id)}
					class="ml-2 text-gray-400 hover:text-gray-600"
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		{/each}
	</div>
{/if}
