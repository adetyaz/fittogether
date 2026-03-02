import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function today(hour: number, minute = 0): Date {
	const d = new Date();
	d.setHours(hour, minute, 0, 0);
	return d;
}

async function main() {
	console.log('🌱 Seeding database…');

	// ── 10 Users ──
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

	// ── Locations (Ilorin, Kwara State, Nigeria) ──
	const locations = [
		{
			name: 'Whitefield Hotels Limited',
			address: 'Plot 367, Along Gerewu Road, off Western Reservoir Road, Ilorin',
			type: 'hotel',
			latitude: 8.492,
			longitude: 4.538
		},
		{
			name: 'Solid Worth Hotel Ilorin',
			address:
				'2 Bello Babatunde Street, Egbejila Road Behind Agaka filling Station, Asada, Ilorin 240101',
			type: 'hotel',
			latitude: 8.488,
			longitude: 4.535
		},
		{
			name: 'Golden Sands Luxury Resorts',
			address: 'Olohunoje Road, Off Babatunde Yinus Street, Irewolede Area Ilorin, Ilorin 240222',
			type: 'leisure_centre',
			latitude: 8.499,
			longitude: 4.545
		},
		{
			name: 'SWAY FITNESS',
			address: 'Tanke Rd, behind GTB, Junction, Ilorin 240103, Kwara',
			type: 'gym',
			latitude: 8.501,
			longitude: 4.538
		},
		{
			name: 'DrDreFitness',
			address: '13 Peter Tokula Road, Doctors House',
			type: 'gym',
			latitude: 8.495,
			longitude: 4.54
		},
		{
			name: 'Utage Gym',
			address: '12 Mahogany Street, Off Adelodun street, GRA',
			type: 'gym',
			latitude: 8.503,
			longitude: 4.542
		},
		{
			name: 'Noktel Gym',
			address: '14 & 16 Noktel drive, off catchment road',
			type: 'gym',
			latitude: 8.492,
			longitude: 4.55
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
		// ── Whitefield Hotels Limited ──
		{ locationIdx: 0, userId: 'user-alice', busyLevel: 'Low', hour: 7, minute: 15 },
		{ locationIdx: 0, userId: 'user-diana', busyLevel: 'Medium', hour: 9, minute: 30 },
		{ locationIdx: 0, userId: 'user-charlie', busyLevel: 'High', hour: 12, minute: 0 },
		{ locationIdx: 0, userId: 'user-fiona', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── Solid Worth Hotel Ilorin ──
		{ locationIdx: 1, userId: 'user-bob', busyLevel: 'Medium', hour: 6, minute: 45 },
		{ locationIdx: 1, userId: 'user-ethan', busyLevel: 'High', hour: 8, minute: 0 },
		{ locationIdx: 1, userId: 'user-george', busyLevel: 'High', hour: 12, minute: 30 },
		{ locationIdx: 1, userId: 'user-ivan', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── Golden Sands Luxury Resorts ──
		{ locationIdx: 2, userId: 'user-ethan', busyLevel: 'Low', hour: 6, minute: 30 },
		{ locationIdx: 2, userId: 'user-hannah', busyLevel: 'Medium', hour: 10, minute: 0 },
		{ locationIdx: 2, userId: 'user-diana', busyLevel: 'High', hour: 13, minute: 0 },
		{ locationIdx: 2, userId: 'user-charlie', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── SWAY FITNESS ──
		{ locationIdx: 3, userId: 'user-bob', busyLevel: 'Low', hour: 5, minute: 30 },
		{ locationIdx: 3, userId: 'user-george', busyLevel: 'Medium', hour: 9, minute: 0 },
		{ locationIdx: 3, userId: 'user-ivan', busyLevel: 'High', hour: 11, minute: 30 },
		{ locationIdx: 3, userId: 'user-alice', busyLevel: 'Low', hour: 15, minute: 0 }, // 3pm → Low

		// ── DrDreFitness ──
		{ locationIdx: 4, userId: 'user-charlie', busyLevel: 'Medium', hour: 7, minute: 0 },
		{ locationIdx: 4, userId: 'user-hannah', busyLevel: 'High', hour: 10, minute: 30 },
		{ locationIdx: 4, userId: 'user-ethan', busyLevel: 'Medium', hour: 13, minute: 15 },
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
		{ challengeIdx: 0, userId: 'user-diana', progress: 5.0 },
		{ challengeIdx: 0, userId: 'user-hannah', progress: 2.8 },
		{ challengeIdx: 0, userId: 'test-user', progress: 3.7 },

		// 10 Gym Visits This Month
		{ challengeIdx: 1, userId: 'user-bob', progress: 8 },
		{ challengeIdx: 1, userId: 'user-ethan', progress: 10 },
		{ challengeIdx: 1, userId: 'user-george', progress: 6 },
		{ challengeIdx: 1, userId: 'user-ivan', progress: 4 },

		// 20 Laps Challenge
		{ challengeIdx: 2, userId: 'user-alice', progress: 20 },
		{ challengeIdx: 2, userId: 'user-charlie', progress: 15 },
		{ challengeIdx: 2, userId: 'user-fiona', progress: 12 },
		{ challengeIdx: 2, userId: 'user-hannah', progress: 18 },

		// Morning Warrior
		{ challengeIdx: 3, userId: 'user-ethan', progress: 7 },
		{ challengeIdx: 3, userId: 'user-charlie', progress: 5 },
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
