import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url }) => {
	const activity = url.searchParams.get('activity');
	const time = url.searchParams.get('time');

	const where: Record<string, unknown> = {};

	if (activity) {
		where.activities = { has: activity };
	}
	if (time) {
		where.workoutTimes = { has: time };
	}

	const users = await prisma.user.findMany({
		where,
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			activities: true,
			workoutTimes: true,
			bio: true
		},
		orderBy: { name: 'asc' }
	});

	return json(users);
};
