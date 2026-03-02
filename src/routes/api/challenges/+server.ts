import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async () => {
	const challenges = await prisma.challenge.findMany({
		include: {
			_count: { select: { entries: true } }
		},
		orderBy: { createdAt: 'desc' }
	});

	return json(challenges);
};
