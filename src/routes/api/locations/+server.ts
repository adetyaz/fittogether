import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async () => {
	const locations = await prisma.location.findMany({
		include: {
			checkIns: {
				orderBy: { createdAt: 'desc' },
				take: 1
			}
		},
		orderBy: { name: 'asc' }
	});

	return json(locations);
};

/** POST /api/locations — create a new location (from Nominatim search result) */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { name, address, latitude, longitude, type } = body;

	if (!name) throw error(400, 'name is required');

	// Check if a location with the same name already exists
	const existing = await prisma.location.findFirst({
		where: { name: { equals: name, mode: 'insensitive' } }
	});

	if (existing) {
		return json(existing, { status: 200 });
	}

	const location = await prisma.location.create({
		data: {
			name,
			address: address || null,
			latitude: latitude ?? null,
			longitude: longitude ?? null,
			type: type || null
		}
	});

	return json(location, { status: 201 });
};
