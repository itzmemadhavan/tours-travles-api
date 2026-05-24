const db = require('./config/db');

async function seed() {
  console.log('Seeding data...');

  try {
    // 1. Check if mock data already exists to avoid duplicates
    const existingTours = await db('tour_packages').count('id as count').first();
    if (existingTours.count > 0) {
      console.log('Database already has data. Skipping seed.');
      process.exit(0);
    }

    // 2. Insert mock tours
    const tours = [
      { title: 'Bali Gateway', destination: 'Bali', description: 'Tropical paradise', price: 1200, duration: 5, available_slots: 20 },
      { title: 'Swiss Alps', destination: 'Switzerland', description: 'Snowy mountains', price: 2500, duration: 7, available_slots: 10 },
      { title: 'Tokyo Lights', destination: 'Japan', description: 'City exploration', price: 1800, duration: 6, available_slots: 15 },
      { title: 'African Safari', destination: 'Kenya', description: 'Wild animals', price: 3000, duration: 10, available_slots: 8 },
    ];
    await db('tour_packages').insert(tours);
    const savedTours = await db('tour_packages').select('id');

    // 3. Insert mock users
    const users = [
      { name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password', role: 'user' },
      { name: 'Alice Lee', email: 'alice@example.com', password: 'password', role: 'user' },
    ];
    await db('users').insert(users);
    const savedUsers = await db('users').where({ role: 'user' }).select('id');

    // 4. Insert mock bookings spread across the last 6 months
    const bookings = [];
    const payments = [];
    const statuses = ['confirmed', 'pending', 'cancelled'];
    const paymentStatuses = ['completed', 'pending', 'failed'];

    // Generate dates for the last 6 months
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const user = savedUsers[Math.floor(Math.random() * savedUsers.length)];
      const tour = savedTours[Math.floor(Math.random() * savedTours.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const payStatus = status === 'confirmed' ? 'completed' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      const pastDate = new Date(today.getFullYear(), today.getMonth() - Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
      const amount = Math.floor(Math.random() * 2000) + 1000;

      bookings.push({
        user_id: user.id,
        package_id: tour.id,
        travel_date: pastDate, // Using travel_date loosely as booking date for charting
        travelers_count: Math.floor(Math.random() * 4) + 1,
        total_amount: amount,
        payment_status: payStatus,
        booking_status: status,
        created_at: pastDate, // Important for charting
        updated_at: pastDate
      });
    }

    await db('bookings').insert(bookings);
    const savedBookings = await db('bookings').select('id', 'total_amount', 'payment_status', 'created_at');

    for (const b of savedBookings) {
      payments.push({
        booking_id: b.id,
        transaction_id: 'TXN' + Math.floor(Math.random() * 1000000),
        amount: b.total_amount,
        payment_method: 'credit_card',
        payment_status: b.payment_status,
        created_at: b.created_at,
        updated_at: b.created_at
      });
    }

    await db('payments').insert(payments);

    console.log('Seeding complete! Added tours, users, bookings, and payments.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
