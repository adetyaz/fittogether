import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params }) => {
	const challenge = await prisma.challenge.findUnique({ where: { id: params.id } });
	if (!challenge) throw error(404, 'Challenge not found');

	const leaderboard = await prisma.challengeEntry.findMany({
		where: { challengeId: params.id },
		include: {
			user: {
				select: { id: true, name: true, image: true }
			}
		},
		orderBy: { progress: 'desc' },
		take: 20
	});

	return json({ challenge, leaderboard });
};
