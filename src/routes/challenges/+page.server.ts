import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? null;

	const challenges = await prisma.challenge.findMany({
		include: {
			_count: { select: { entries: true } }
		},
		orderBy: { createdAt: 'desc' }
	});

	// Fetch which challenges the user has joined
	const entries = userId
		? await prisma.challengeEntry.findMany({
				where: { userId },
				select: { challengeId: true }
			})
		: [];
	const joinedIds = entries.map((e) => e.challengeId);

	return { challenges, joinedIds };
};
