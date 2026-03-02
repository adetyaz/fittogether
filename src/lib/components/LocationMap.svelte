<script lang="ts">
	import { onMount } from 'svelte';
	import type L from 'leaflet';

	type MapLocation = {
		id: string;
		name: string;
		latitude: number | null;
		longitude: number | null;
		address?: string | null;
		busyLevel?: string | null;
	};

	let { locations = [], onSelect }: { locations: MapLocation[]; onSelect?: (id: string) => void } =
		$props();

	let mapContainer: HTMLDivElement;
	let map: L.Map;

	const busyColors: Record<string, string> = {
		Low: '#22c55e',
		Medium: '#eab308',
		High: '#ef4444'
	};

	onMount(() => {
		loadMap();

		return () => {
			map?.remove();
		};
	});

	async function loadMap() {
		const leaflet = await import('leaflet');
		await import('leaflet/dist/leaflet.css');

		// Default center: London
		map = leaflet.default.map(mapContainer).setView([51.505, -0.09], 12);

		leaflet.default
			.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
			.addTo(map);

		addMarkers(leaflet.default);
	}

	function addMarkers(leaflet: typeof L) {
		const mappable = locations.filter((l) => l.latitude != null && l.longitude != null);
		if (mappable.length === 0) return;

		const bounds: L.LatLngExpression[] = [];

		for (const loc of mappable) {
			const color = busyColors[loc.busyLevel ?? ''] ?? '#6b7280';

			const icon = leaflet.divIcon({
				className: 'custom-marker',
				html: `<div style="
					width: 28px; height: 28px;
					background: ${color};
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 2px 6px rgba(0,0,0,0.3);
				"></div>`,
				iconSize: [28, 28],
				iconAnchor: [14, 14]
			});

			const marker = leaflet
				.marker([loc.latitude!, loc.longitude!], { icon })
				.addTo(map)
				.bindPopup(
					`<strong>${loc.name}</strong>${loc.address ? `<br/><span style="font-size:12px;color:#666">${loc.address}</span>` : ''}`
				);

			if (onSelect) {
				marker.on('click', () => onSelect!(loc.id));
			}

			bounds.push([loc.latitude!, loc.longitude!]);
		}

		if (bounds.length > 1) {
			map.fitBounds(leaflet.latLngBounds(bounds), { padding: [40, 40] });
		} else if (bounds.length === 1) {
			map.setView(bounds[0], 14);
		}
	}
</script>

<div bind:this={mapContainer} class="h-80 w-full rounded-xl border border-gray-200 shadow-sm"></div>

<style>
	:global(.custom-marker) {
		background: transparent !important;
		border: none !important;
	}
</style>
