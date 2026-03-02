import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

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
