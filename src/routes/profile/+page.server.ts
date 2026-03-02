import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw redirect(303, '/');
	const userId = session.user.id;

	const [user, incomingRequests] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			include: {
				checkIns: {
					include: { location: { select: { name: true } } },
					orderBy: { createdAt: 'desc' },
					take: 10
				},
				challengeEntries: {
					include: {
						challenge: { select: { name: true, goalValue: true, unit: true } }
					},
					orderBy: { joinedAt: 'desc' }
				}
			}
		}),
		prisma.buddyRequest.findMany({
			where: { toUserId: userId, status: 'pending' },
			include: {
				fromUser: {
					select: { id: true, name: true, image: true, activities: true, bio: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})
	]);

	return { profile: user, incomingRequests };
};
