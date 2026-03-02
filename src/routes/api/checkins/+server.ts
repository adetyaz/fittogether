import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return json({ message: 'Sign in to report busyness' }, { status: 401 });
	const userId = session.user.id;

	const { locationId, busyLevel } = await event.request.json();

	if (!locationId || !['Low', 'Medium', 'High'].includes(busyLevel)) {
		throw error(400, 'Invalid locationId or busyLevel');
	}

	const checkIn = await prisma.checkIn.create({
		data: {
			busyLevel,
			userId,
			locationId
		}
	});

	return json(checkIn, { status: 201 });
};
