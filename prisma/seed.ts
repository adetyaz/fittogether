import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function today(hour: number, minute = 0): Date {
	const d = new Date();
	d.setHours(hour, minute, 0, 0);
	return d;
}

async function main() {
	console.log('🌱 Seeding database…');

	// ── 15 Users ──
	const users = [
		{
			id: 'test-user',
			name: 'Test User',
			email: 'test@fittogether.dev',
			phone: '+447000000000',
			activities: ['swim', 'gym'],
			workoutTimes: ['morning', 'evening'],
			bio: 'Testing out FitTogether!'
		},
		{
			id: 'user-alice',
			name: 'Alice Chen',
			email: 'alice@example.com',
			phone: '+447111000001',
			activities: ['swim'],
			workoutTimes: ['morning'],
			bio: 'Early bird swimmer 🏊‍♀️'
		},
		{
			id: 'user-bob',
			name: 'Bob Okafor',
			email: 'bob@example.com',
			phone: '+447111000002',
			activities: ['gym'],
			workoutTimes: ['evening'],
			bio: 'Gym after work, every day.'
		},
		{
			id: 'user-charlie',
			name: 'Charlie Singh',
			email: 'charlie@example.com',
			phone: '+447111000003',
			activities: ['swim', 'gym'],
			workoutTimes: ['morning', 'weekend'],
			bio: 'Weekend warrior 💪'
		},
		{
			id: 'user-diana',
			name: 'Diana Kowalski',
			email: 'diana@example.com',
			phone: '+447111000004',
			activities: ['swim'],
			workoutTimes: ['evening'],
			bio: 'Love a good evening swim.'
		},
		{
			id: 'user-ethan',
			name: 'Ethan Williams',
			email: 'ethan@example.com',
			phone: '+447111000005',
			activities: ['gym'],
			workoutTimes: ['morning'],
			bio: "Personal trainer. Let's go!"
		},
		{
			id: 'user-fiona',
			name: 'Fiona Adeyemi',
			email: 'fiona@example.com',
			phone: '+447111000006',
			activities: ['swim'],
			workoutTimes: ['weekend'],
			bio: 'Weekend laps at the lido.'
		},
		{
			id: 'user-george',
			name: 'George Kim',
			email: 'george@example.com',
			phone: '+447111000007',
			activities: ['gym'],
			workoutTimes: ['morning', 'evening'],
			bio: 'Twice a day, every day.'
		},
		{
			id: 'user-hannah',
			name: 'Hannah Müller',
			email: 'hannah@example.com',
			phone: '+447111000008',
			activities: ['swim', 'gym'],
			workoutTimes: ['evening'],
			bio: 'Cross-training enthusiast.'
		},
		{
			id: 'user-ivan',
			name: 'Ivan Rossi',
			email: 'ivan@example.com',
			phone: '+447111000009',
			activities: ['gym'],
			workoutTimes: ['morning'],
			bio: 'Heavy lifts, early starts.'
		},
		{
			id: 'user-jade',
			name: 'Jade Thompson',
			email: 'jade@example.com',
			phone: '+447111000010',
			activities: ['swim'],
			workoutTimes: ['morning', 'weekend'],
			bio: 'Training for a triathlon 🏅'
		},
		{
			id: 'user-karl',
			name: 'Karl Bergström',
			email: 'karl@example.com',
			phone: '+447111000011',
			activities: ['gym'],
			workoutTimes: ['evening'],
			bio: 'Calisthenics fan.'
		},
		{
			id: 'user-luna',
			name: 'Luna Fernandez',
			email: 'luna@example.com',
			phone: '+447111000012',
			activities: ['swim', 'gym'],
			workoutTimes: ['morning'],
			bio: 'Morning cardio then pool.'
		},
		{
			id: 'user-marcus',
			name: 'Marcus Johnson',
			email: 'marcus@example.com',
			phone: '+447111000013',
			activities: ['gym'],
			workoutTimes: ['weekend'],
			bio: 'Weekends only, going hard.'
		},
		{
			id: 'user-nadia',
			name: 'Nadia Patel',
			email: 'nadia@example.com',
			phone: '+447111000014',
			activities: ['swim'],
			workoutTimes: ['evening', 'weekend'],
			bio: 'Relaxing swims after work 🌊'
		}
	];

	for (const u of users) {
		await prisma.user.upsert({
			where: { id: u.id },
			update: {},
			create: u
		});
	}
	console.log(`  ✓ ${users.length} users`);

	// ── Locations (with real London-area coordinates) ──
	const locations = [
		{
			name: 'London Fields Lido',
			address: 'London Fields Westside, London E8 3EU',
			type: 'pool',
			latitude: 51.5413,
			longitude: -0.0579
		},
		{
			name: 'PureGym London Tower Hill',
			address: '2 Shorter St, London E1 8LP',
			type: 'gym',
			latitude: 51.5096,
			longitude: -0.074
		},
		{
			name: 'Ironmonger Row Baths',
			address: '1-11 Ironmonger Row, London EC1V 3QN',
			type: 'pool',
			latitude: 51.5273,
			longitude: -0.0882
		},
		{
			name: 'The Gym Group Stratford',
			address: '289 High St, London E15 2TF',
			type: 'gym',
			latitude: 51.5418,
			longitude: -0.0005
		},
		{
			name: 'Clissold Leisure Centre',
			address: '63 Clissold Rd, London N16 9EX',
			type: 'leisure_centre',
			latitude: 51.5614,
			longitude: -0.0862
		}
	];

	for (const loc of locations) {
		await prisma.location.upsert({
			where: { id: loc.name.toLowerCase().replace(/\s+/g, '-') },
			update: {
				address: loc.address,
				type: loc.type,
				latitude: loc.latitude,
				longitude: loc.longitude
			},
			create: {
				id: loc.name.toLowerCase().replace(/\s+/g, '-'),
				name: loc.name,
				address: loc.address,
				type: loc.type,
				latitude: loc.latitude,
				longitude: loc.longitude
			}
		});
	}

	console.log(`  ✓ ${locations.length} locations`);

	// ── Check-ins (various levels, with latest at 3pm = Low) ──
	// Clear old check-ins so we get a clean state
	await prisma.checkIn.deleteMany();

	const locationIds = locations.map((l) => l.name.toLowerCase().replace(/\s+/g, '-'));

	// Earlier check-ins throughout the day showing varying busyness
	const checkInData: {
		locationIdx: number;
		userId: string;
		busyLevel: string;
		hour: number;
		minute: number;
	}[] = [
		// ── London Fields Lido ──
		{ locationIdx: 0, userId: 'user-alice', busyLevel: 'Low', hour: 7, minute: 15 },
		{ locationIdx: 0, userId: 'user-jade', busyLevel: 'Medium', hour: 9, minute: 30 },
		{ locationIdx: 0, userId: 'user-diana', busyLevel: 'High', hour: 12, minute: 0 },
		{ locationIdx: 0, userId: 'user-fiona', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── PureGym Tower Hill ──
		{ locationIdx: 1, userId: 'user-bob', busyLevel: 'Medium', hour: 6, minute: 45 },
		{ locationIdx: 1, userId: 'user-ethan', busyLevel: 'High', hour: 8, minute: 0 },
		{ locationIdx: 1, userId: 'user-george', busyLevel: 'High', hour: 12, minute: 30 },
		{ locationIdx: 1, userId: 'user-ivan', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── Ironmonger Row Baths ──
		{ locationIdx: 2, userId: 'user-luna', busyLevel: 'Low', hour: 6, minute: 30 },
		{ locationIdx: 2, userId: 'user-hannah', busyLevel: 'Medium', hour: 10, minute: 0 },
		{ locationIdx: 2, userId: 'user-nadia', busyLevel: 'High', hour: 13, minute: 0 },
		{ locationIdx: 2, userId: 'user-charlie', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── The Gym Group Stratford ──
		{ locationIdx: 3, userId: 'user-karl', busyLevel: 'Low', hour: 5, minute: 30 },
		{ locationIdx: 3, userId: 'user-marcus', busyLevel: 'Medium', hour: 9, minute: 0 },
		{ locationIdx: 3, userId: 'user-george', busyLevel: 'High', hour: 11, minute: 30 },
		{ locationIdx: 3, userId: 'user-bob', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── Clissold Leisure Centre ──
		{ locationIdx: 4, userId: 'user-charlie', busyLevel: 'Medium', hour: 7, minute: 0 },
		{ locationIdx: 4, userId: 'user-jade', busyLevel: 'High', hour: 10, minute: 30 },
		{ locationIdx: 4, userId: 'user-alice', busyLevel: 'Medium', hour: 13, minute: 15 },
		{ locationIdx: 4, userId: 'test-user', busyLevel: 'Low', hour: 15, minute: 0 } // 3pm → Low
	];

	for (const ci of checkInData) {
		await prisma.checkIn.create({
			data: {
				locationId: locationIds[ci.locationIdx],
				userId: ci.userId,
				busyLevel: ci.busyLevel,
				createdAt: today(ci.hour, ci.minute)
			}
		});
	}

	console.log(`  ✓ ${checkInData.length} check-ins`);

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

	// ── Challenge Entries (some users joined + have progress) ──
	await prisma.workoutLog.deleteMany();
	await prisma.challengeEntry.deleteMany();

	const challengeIds = challenges.map((c) => c.name.toLowerCase().replace(/\s+/g, '-'));

	const entries: { challengeIdx: number; userId: string; progress: number }[] = [
		// Swim 5km in a Week
		{ challengeIdx: 0, userId: 'user-alice', progress: 4.2 },
		{ challengeIdx: 0, userId: 'user-jade', progress: 3.1 },
		{ challengeIdx: 0, userId: 'user-diana', progress: 5.0 },
		{ challengeIdx: 0, userId: 'user-luna', progress: 2.8 },
		{ challengeIdx: 0, userId: 'user-nadia', progress: 1.5 },
		{ challengeIdx: 0, userId: 'test-user', progress: 3.7 },

		// 10 Gym Visits This Month
		{ challengeIdx: 1, userId: 'user-bob', progress: 8 },
		{ challengeIdx: 1, userId: 'user-ethan', progress: 10 },
		{ challengeIdx: 1, userId: 'user-george', progress: 6 },
		{ challengeIdx: 1, userId: 'user-ivan', progress: 4 },
		{ challengeIdx: 1, userId: 'user-karl', progress: 7 },
		{ challengeIdx: 1, userId: 'user-marcus', progress: 3 },

		// 20 Laps Challenge
		{ challengeIdx: 2, userId: 'user-alice', progress: 20 },
		{ challengeIdx: 2, userId: 'user-charlie', progress: 15 },
		{ challengeIdx: 2, userId: 'user-fiona', progress: 12 },
		{ challengeIdx: 2, userId: 'user-hannah', progress: 18 },

		// Morning Warrior
		{ challengeIdx: 3, userId: 'user-ethan', progress: 7 },
		{ challengeIdx: 3, userId: 'user-luna', progress: 5 },
		{ challengeIdx: 3, userId: 'user-ivan', progress: 4 },
		{ challengeIdx: 3, userId: 'test-user', progress: 2 }
	];

	for (const e of entries) {
		await prisma.challengeEntry.create({
			data: {
				userId: e.userId,
				challengeId: challengeIds[e.challengeIdx],
				progress: e.progress
			}
		});
	}

	console.log(`  ✓ ${entries.length} challenge entries`);

	console.log('🌱 Done!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
