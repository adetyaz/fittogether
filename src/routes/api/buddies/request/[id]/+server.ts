import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

/** PATCH /api/buddies/request/[id] — Accept or reject a buddy request */
export const PATCH: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

	const requestId = event.params.id;
	const { action } = await event.request.json();

	if (!['accept', 'reject'].includes(action)) {
		throw error(400, 'action must be "accept" or "reject"');
	}

	const request = await prisma.buddyRequest.findUnique({
		where: { id: requestId }
	});

	if (!request) throw error(404, 'Request not found');

	// Only the recipient can accept/reject
	if (request.toUserId !== userId) {
		throw error(403, 'Only the recipient can respond to this request');
	}

	if (request.status !== 'pending') {
		throw error(409, `Request already ${request.status}`);
	}

	const updated = await prisma.buddyRequest.update({
		where: { id: requestId },
		data: { status: action === 'accept' ? 'accepted' : 'rejected' }
	});

	return json(updated);
};
