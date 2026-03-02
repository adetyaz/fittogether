import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params }) => {
	const user = await prisma.user.findUnique({
		where: { id: params.id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			activities: true,
			workoutTimes: true,
			bio: true
		}
	});

	if (!user) throw error(404, 'User not found');
	return json(user);
};

export const PUT: RequestHandler = async (event) => {
	const body = await event.request.json();
	const { activities, workoutTimes, phone, bio } = body;

	const user = await prisma.user.update({
		where: { id: event.params.id },
		data: {
			...(activities !== undefined && { activities }),
			...(workoutTimes !== undefined && { workoutTimes }),
			...(phone !== undefined && { phone }),
			...(bio !== undefined && { bio })
		}
	});

	return json(user);
};
