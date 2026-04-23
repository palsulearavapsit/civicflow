import * as admin from 'firebase-admin';

// Initialize with service account (for local use)
// admin.initializeApp({ ... });

const db = admin.firestore();

const seedData = async () => {
  console.log("Seeding election data...");

  // Seed Election Rules
  const rules = [
    {
      state: 'California',
      registrationDeadline: admin.firestore.Timestamp.fromDate(new Date(2026, 9, 19)),
      earlyVotingStart: admin.firestore.Timestamp.fromDate(new Date(2026, 9, 5)),
      idRequirements: "Valid CA driver's license or last 4 digits of SSN.",
    },
    {
      state: 'New York',
      registrationDeadline: admin.firestore.Timestamp.fromDate(new Date(2026, 9, 9)),
      earlyVotingStart: admin.firestore.Timestamp.fromDate(new Date(2026, 9, 24)),
      idRequirements: "Signature match or government ID for first-time voters.",
    }
  ];

  for (const rule of rules) {
    await db.collection('election_rules').doc(rule.state).set(rule);
  }

  // Seed Myths vs Facts
  const myths = [
    {
      myth: "Voting by mail is not secure and leads to fraud.",
      fact: "Mail-in voting has been used for decades with extremely low fraud rates. Ballots are tracked and signatures are verified.",
      source: "Cybersecurity & Infrastructure Security Agency (CISA)",
      sourceUrl: "https://www.cisa.gov/rumorcontrol"
    },
    {
      myth: "You can vote online in the presidential election.",
      fact: "No state currently allows online voting for the general public. All votes must be cast in-person or by mail.",
      source: "Vote.gov",
      sourceUrl: "https://vote.gov"
    }
  ];

  for (const m of myths) {
    await db.collection('myths_facts').add(m);
  }

  console.log("Seeding completed successfully!");
};

seedData();
