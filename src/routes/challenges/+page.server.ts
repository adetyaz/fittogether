import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

	const challenges = await prisma.challenge.findMany({
		include: {
			_count: { select: { entries: true } }
		},
		orderBy: { createdAt: 'desc' }
	});

	// Fetch which challenges the user has joined
	const entries = await prisma.challengeEntry.findMany({
		where: { userId },
		select: { challengeId: true }
	});
	const joinedIds = entries.map((e) => e.challengeId);

	return { challenges, joinedIds };
};
