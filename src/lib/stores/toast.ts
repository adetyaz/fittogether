import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	duration: number;
}

let nextId = 0;

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(message: string, type: ToastType = 'info', duration = 4000) {
		const id = nextId++;
		update((toasts) => [...toasts, { id, message, type, duration }]);

		if (duration > 0) {
			setTimeout(() => remove(id), duration);
		}

		return id;
	}

	function remove(id: number) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		add,
		remove,
		success: (msg: string, duration?: number) => add(msg, 'success', duration),
		error: (msg: string, duration?: number) => add(msg, 'error', duration ?? 5000),
		info: (msg: string, duration?: number) => add(msg, 'info', duration),
		warning: (msg: string, duration?: number) => add(msg, 'warning', duration ?? 5000)
	};
}

export const toast = createToastStore();
