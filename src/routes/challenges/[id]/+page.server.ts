import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? null;
	const challengeId = event.params.id;

	const challenge = await prisma.challenge.findUnique({
		where: { id: challengeId }
	});
	if (!challenge) throw error(404, 'Challenge not found');

	const leaderboard = await prisma.challengeEntry.findMany({
		where: { challengeId },
		include: {
			user: { select: { id: true, name: true, image: true } }
		},
		orderBy: { progress: 'desc' },
		take: 20
	});

	// Current user's entry (if joined)
	const myEntry = userId
		? (leaderboard.find((e) => e.userId === userId) ??
			(await prisma.challengeEntry.findUnique({
				where: { userId_challengeId: { userId, challengeId } },
				include: { user: { select: { id: true, name: true, image: true } } }
			})))
		: null;

	return { challenge, leaderboard, myEntry };
};
