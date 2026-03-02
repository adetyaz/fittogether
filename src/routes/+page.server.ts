import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const locations = await prisma.location.findMany({
		include: {
			checkIns: {
				orderBy: { createdAt: 'desc' },
				take: 1
			}
		},
		orderBy: { name: 'asc' }
	});

	return { locations };
};
