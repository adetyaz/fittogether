import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

/** POST /api/buddies/request — Send a buddy request */
export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	const fromUserId = session?.user?.id ?? TEST_USER_ID;

	const { toUserId } = await event.request.json();
	if (!toUserId) throw error(400, 'toUserId is required');
	if (toUserId === fromUserId) throw error(400, 'Cannot send a request to yourself');

	// Check if request already exists (in either direction)
	const existing = await prisma.buddyRequest.findFirst({
		where: {
			OR: [
				{ fromUserId, toUserId },
				{ fromUserId: toUserId, toUserId: fromUserId }
			]
		}
	});

	if (existing) {
		if (existing.status === 'rejected') {
			// Allow re-sending if previously rejected
			const updated = await prisma.buddyRequest.update({
				where: { id: existing.id },
				data: { status: 'pending', fromUserId, toUserId }
			});
			return json(updated);
		}
		throw error(
			409,
			existing.status === 'pending' ? 'Request already pending' : 'You are already buddies'
		);
	}

	const request = await prisma.buddyRequest.create({
		data: { fromUserId, toUserId }
	});

	return json(request, { status: 201 });
};

/** GET /api/buddies/request — Get buddy connection states for current user */
export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

	const requests = await prisma.buddyRequest.findMany({
		where: {
			OR: [{ fromUserId: userId }, { toUserId: userId }]
		},
		include: {
			fromUser: { select: { id: true, name: true, image: true } },
			toUser: { select: { id: true, name: true, image: true } }
		},
		orderBy: { createdAt: 'desc' }
	});

	return json(requests);
};
