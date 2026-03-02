import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

/** PATCH /api/users/status — Toggle activeStatus (at_gym, at_pool, or null) */
export const PATCH: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id)
		return json({ message: 'Sign in to update your status' }, { status: 401 });
	const userId = session.user.id;

	const { activeStatus } = await event.request.json();

	// Validate: null, "at_gym", or "at_pool"
	if (activeStatus !== null && !['at_gym', 'at_pool'].includes(activeStatus)) {
		throw error(400, 'activeStatus must be null, "at_gym", or "at_pool"');
	}

	const user = await prisma.user.update({
		where: { id: userId },
		data: { activeStatus }
	});

	return json({ activeStatus: user.activeStatus });
};
