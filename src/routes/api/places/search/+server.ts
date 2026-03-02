import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * Search for places using OpenStreetMap Nominatim.
 * GET /api/places/search?q=Sunrise+Gym+London
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q || q.length < 2) {
		throw error(400, 'Query must be at least 2 characters');
	}

	const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
	nominatimUrl.searchParams.set('q', q);
	nominatimUrl.searchParams.set('format', 'json');
	nominatimUrl.searchParams.set('addressdetails', '1');
	nominatimUrl.searchParams.set('limit', '5');
	// Bias towards leisure/sport results
	nominatimUrl.searchParams.set('extratags', '1');

	const res = await fetch(nominatimUrl.toString(), {
		headers: {
			// Nominatim requires a User-Agent
			'User-Agent': 'FitTogether/1.0 (contact@fittogether.dev)'
		}
	});

	if (!res.ok) {
		throw error(502, 'Nominatim API error');
	}

	const results = await res.json();

	// Map to a simpler shape
	const places = results.map(
		(r: {
			place_id: number;
			display_name: string;
			lat: string;
			lon: string;
			type: string;
			class: string;
			address?: Record<string, string>;
			extratags?: Record<string, string>;
		}) => ({
			nominatimId: r.place_id,
			name: buildName(r),
			displayName: r.display_name,
			latitude: parseFloat(r.lat),
			longitude: parseFloat(r.lon),
			type: r.type ?? r.class ?? 'unknown',
			address: buildAddress(r.address)
		})
	);

	return json(places);
};

function buildName(r: { display_name: string; address?: Record<string, string> }): string {
	// Use the first part of display_name (before the first comma) as the short name
	return r.display_name.split(',')[0].trim();
}

function buildAddress(addr?: Record<string, string>): string {
	if (!addr) return '';
	const parts = [
		addr.road,
		addr.house_number,
		addr.suburb || addr.neighbourhood,
		addr.city || addr.town || addr.village,
		addr.postcode
	].filter(Boolean);
	return parts.join(', ');
}
