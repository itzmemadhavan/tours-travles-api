const db = require('./config/db');

async function seed() {
  console.log('Seeding beautiful tour packages...');

  try {
    // Delete existing packages so we only have the new beautiful ones
    await db('tour_packages').del();

    const packages = [
      {
        package_name: 'Golden Triangle Tour',
        duration: '5 Days / 4 Nights',
        destination: 'Delhi – Agra – Jaipur',
        price: 18999,
        description: 'Experience the rich heritage of India by exploring the majestic forts, palaces, and the iconic Taj Mahal.',
        category: 'Heritage',
        thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
        inclusions: JSON.stringify(['4-Star Hotel Stay', 'Breakfast & Dinner', 'AC Transfers', 'Guide']),
        exclusions: JSON.stringify(['Flights', 'Entry Tickets', 'Personal Expenses']),
        rating: 4.8,
        status: 'active'
      },
      {
        package_name: 'Kashmir Paradise Tour',
        duration: '6 Days / 5 Nights',
        destination: 'Srinagar – Gulmarg – Pahalgam',
        price: 29999,
        description: 'Immerse yourself in the breathtaking beauty of the Kashmir Valley, stay in a houseboat, and enjoy the snow-capped peaks.',
        category: 'Honeymoon',
        thumbnail: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80',
        inclusions: JSON.stringify(['Houseboat Stay', 'Shikara Ride', 'Breakfast & Dinner', 'Cabs']),
        exclusions: JSON.stringify(['Flights', 'Gondola Ride Tickets']),
        rating: 4.9,
        status: 'active'
      },
      {
        package_name: 'Kerala Backwater Escape',
        duration: '4 Days / 3 Nights',
        destination: 'Munnar – Alleppey – Kochi',
        price: 21999,
        description: 'A serene journey through the lush green tea gardens of Munnar and a luxurious overnight stay in the famous Alleppey houseboats.',
        category: 'Nature',
        thumbnail: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
        inclusions: JSON.stringify(['Premium Houseboat', 'All Meals on Houseboat', 'Private Cab']),
        exclusions: JSON.stringify(['Flights', 'Ayurvedic Massage']),
        rating: 4.7,
        status: 'active'
      },
      {
        package_name: 'Goa Beach Holiday',
        duration: '3 Days / 2 Nights',
        destination: 'North Goa – South Goa',
        price: 12999,
        description: 'Unwind on the pristine beaches of Goa. Experience vibrant nightlife, Portuguese architecture, and thrilling water sports.',
        category: 'Beach',
        thumbnail: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
        inclusions: JSON.stringify(['Resort Stay', 'Breakfast', 'Scooter Rental']),
        exclusions: JSON.stringify(['Flights', 'Water Sports', 'Meals']),
        rating: 4.5,
        status: 'active'
      },
      {
        package_name: 'Himachal Adventure Trip',
        duration: '6 Days / 5 Nights',
        destination: 'Manali – Shimla',
        price: 24999,
        description: 'An adrenaline-filled journey through the Himalayas. Perfect for trekking, river rafting, and enjoying the snow.',
        category: 'Adventure',
        thumbnail: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
        inclusions: JSON.stringify(['Hotel Stay', 'Breakfast & Dinner', 'Solang Valley Tour']),
        exclusions: JSON.stringify(['Flights', 'Rohtang Pass Permit', 'Adventure Activities']),
        rating: 4.6,
        status: 'active'
      },
      {
        package_name: 'Leh Ladakh Bike Trip',
        duration: '8 Days / 7 Nights',
        destination: 'Leh – Nubra – Pangong',
        price: 39999,
        description: 'The ultimate bucket-list road trip! Ride through the highest motorable passes and witness the stunning Pangong Lake.',
        category: 'Adventure',
        thumbnail: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
        inclusions: JSON.stringify(['Royal Enfield Bike', 'Fuel', 'Mechanic Backup', 'Camp Stay', 'Meals']),
        exclusions: JSON.stringify(['Flights', 'Riding Gear', 'Personal Insurance']),
        rating: 4.9,
        status: 'active'
      }
    ];

    await db('tour_packages').insert(packages);
    console.log('Seeding complete! Added stunning tour packages.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
