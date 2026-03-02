import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	const activity = event.url.searchParams.get('activity');
	const time = event.url.searchParams.get('time');

	const where: Record<string, unknown> = {};

	if (activity) {
		where.activities = { has: activity };
	}
	if (time) {
		where.workoutTimes = { has: time };
	}

	// Exclude current user from list
	if (session?.user?.id) {
		where.id = { not: session.user.id };
	}

	const buddies = await prisma.user.findMany({
		where,
		select: {
			id: true,
			name: true,
			phone: true,
			image: true,
			activities: true,
			workoutTimes: true,
			bio: true
		},
		orderBy: { name: 'asc' }
	});

	return { buddies, filters: { activity, time } };
};
