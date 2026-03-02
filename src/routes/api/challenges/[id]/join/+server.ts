import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

	const challengeId = event.params.id;

	// Check if challenge exists
	const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
	if (!challenge) throw error(404, 'Challenge not found');

	// Check if already joined
	const existing = await prisma.challengeEntry.findUnique({
		where: { userId_challengeId: { userId, challengeId } }
	});
	if (existing) throw error(409, 'You have already joined this challenge');

	const entry = await prisma.challengeEntry.create({
		data: {
			userId,
			challengeId
		}
	});

	return json(entry, { status: 201 });
};
