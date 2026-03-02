import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: ServerLoad = async ({ params }) => {
	const location = await prisma.location.findUnique({
		where: { id: params.id },
		include: {
			checkIns: {
				include: {
					user: { select: { name: true, image: true } }
				},
				orderBy: { createdAt: 'desc' },
				take: 20
			}
		}
	});

	if (!location) throw error(404, 'Location not found');

	return { location };
};
