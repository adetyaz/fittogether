import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding database…');

	// ── Test User ──
	await prisma.user.upsert({
		where: { id: 'test-user' },
		update: {},
		create: {
			id: 'test-user',
			name: 'Test User',
			email: 'test@fittogether.dev',
			phone: '+447000000000'
		}
	});
	console.log('  ✓ test user');

	// ── Locations ──
	const locations = [
		{ name: 'City Pool', address: '123 Main St' },
		{ name: 'Sunrise Gym', address: '456 Oak Ave' },
		{ name: 'Aqua Centre', address: '789 River Rd' },
		{ name: 'Iron Works Fitness', address: '22 Steel Blvd' },
		{ name: 'Community Leisure Pool', address: '10 Park Lane' }
	];

	for (const loc of locations) {
		await prisma.location.upsert({
			where: { id: loc.name.toLowerCase().replace(/\s+/g, '-') },
			update: {},
			create: {
				id: loc.name.toLowerCase().replace(/\s+/g, '-'),
				name: loc.name,
				address: loc.address
			}
		});
	}

	console.log(`  ✓ ${locations.length} locations`);

	// ── Challenges ──
	const challenges = [
		{
			name: 'Swim 5km in a Week',
			description: 'Rack up 5 kilometres in the pool this week.',
			goalType: 'distance',
			goalValue: 5,
			unit: 'km'
		},
		{
			name: '10 Gym Visits This Month',
			description: 'Show up at the gym 10 times before the month ends.',
			goalType: 'count',
			goalValue: 10,
			unit: 'visits'
		},
		{
			name: '20 Laps Challenge',
			description: 'Swim 20 pool lengths in a single session.',
			goalType: 'count',
			goalValue: 20,
			unit: 'laps'
		},
		{
			name: 'Morning Warrior',
			description: 'Complete 7 morning workouts in a row.',
			goalType: 'count',
			goalValue: 7,
			unit: 'sessions'
		}
	];

	for (const ch of challenges) {
		await prisma.challenge.upsert({
			where: { id: ch.name.toLowerCase().replace(/\s+/g, '-') },
			update: {},
			create: {
				id: ch.name.toLowerCase().replace(/\s+/g, '-'),
				...ch
			}
		});
	}

	console.log(`  ✓ ${challenges.length} challenges`);

	console.log('🌱 Done!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
