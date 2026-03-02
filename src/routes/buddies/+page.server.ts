import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

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
	where.id = { not: userId };

	const buddies = await prisma.user.findMany({
		where,
		select: {
			id: true,
			name: true,
			phone: true,
			image: true,
			activities: true,
			workoutTimes: true,
			bio: true,
			activeStatus: true
		},
		orderBy: { name: 'asc' }
	});

	// Fetch all buddy requests involving the current user
	const buddyRequests = await prisma.buddyRequest.findMany({
		where: {
			OR: [{ fromUserId: userId }, { toUserId: userId }]
		},
		select: {
			id: true,
			fromUserId: true,
			toUserId: true,
			status: true
		}
	});

	// Build a map: otherUserId → { requestId, status, direction }
	const buddyMap: Record<string, { requestId: string; status: string; isSender: boolean }> = {};
	for (const r of buddyRequests) {
		const otherId = r.fromUserId === userId ? r.toUserId : r.fromUserId;
		buddyMap[otherId] = {
			requestId: r.id,
			status: r.status,
			isSender: r.fromUserId === userId
		};
	}

	return { buddies, buddyMap, filters: { activity, time }, userId };
};
