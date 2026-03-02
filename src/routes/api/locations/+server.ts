import { json } from '@sveltejs/kit';
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
