import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { TEST_USER_ID } from '$lib';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	const userId = session?.user?.id ?? TEST_USER_ID;

	const challengeId = event.params.id;
	const { value } = await event.request.json();

	if (typeof value !== 'number' || value <= 0) {
		throw error(400, 'value must be a positive number');
	}

	// Find the user's entry for this challenge
	const entry = await prisma.challengeEntry.findUnique({
		where: { userId_challengeId: { userId, challengeId } }
	});
	if (!entry) throw error(404, 'You have not joined this challenge');

	// Create workout log and update progress in a transaction
	const [log] = await prisma.$transaction([
		prisma.workoutLog.create({
			data: { entryId: entry.id, value }
		}),
		prisma.challengeEntry.update({
			where: { id: entry.id },
			data: { progress: { increment: value } }
		})
	]);

	return json(log, { status: 201 });
};
