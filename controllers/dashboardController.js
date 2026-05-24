const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total Bookings
    const bookingsResult = await db('bookings').count('id as count').first();
    const totalBookings = bookingsResult.count;

    // Total Revenue (only completed payments)
    const revenueResult = await db('payments')
      .where('payment_status', 'completed')
      .sum('amount as total')
      .first();
    const totalRevenue = revenueResult.total || 0;

    // Active Tours
    const toursResult = await db('tour_packages').count('id as count').first();
    const activeTours = toursResult.count;

    // Total Registered Users
    const usersResult = await db('users').where('role', 'user').count('id as count').first();
    const totalUsers = usersResult.count;

    // Recent 5 Bookings
    const recentBookings = await db('bookings')
      .join('users', 'bookings.user_id', '=', 'users.id')
      .join('tour_packages', 'bookings.package_id', '=', 'tour_packages.id')
      .select(
        'bookings.id',
        'users.name as user_name',
        'tour_packages.title as package_title',
        'bookings.total_amount',
        'bookings.booking_status',
        'bookings.created_at'
      )
      .orderBy('bookings.created_at', 'desc')
      .limit(5);

    // Chart Data (Bookings & Revenue per month for last 6 months)
    // Note: We'll aggregate simply by fetching recent bookings and grouping in JS for cross-db compatibility
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const recentData = await db('bookings')
      .leftJoin('payments', 'bookings.id', '=', 'payments.booking_id')
      .where('bookings.created_at', '>=', sixMonthsAgo)
      .select('bookings.created_at', 'payments.amount', 'payments.payment_status');

    const monthlyStats = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyStats[monthYear] = { name: monthYear, bookings: 0, revenue: 0 };
    }

    // Populate data
    recentData.forEach(row => {
      const date = new Date(row.created_at);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyStats[monthYear]) {
        monthlyStats[monthYear].bookings += 1;
        if (row.payment_status === 'completed' && row.amount) {
          monthlyStats[monthYear].revenue += parseFloat(row.amount);
        }
      }
    });

    const chartData = Object.values(monthlyStats);

    res.status(200).json({
      stats: {
        totalBookings,
        totalRevenue,
        activeTours,
        totalUsers
      },
      recentBookings,
      chartData
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const bookings = await db('bookings')
      .join('tour_packages', 'bookings.package_id', '=', 'tour_packages.id')
      .where('bookings.user_id', userId)
      .select(
        'bookings.id',
        'tour_packages.title as package_title',
        'tour_packages.destination',
        'bookings.travel_date',
        'bookings.travelers_count',
        'bookings.total_amount',
        'bookings.booking_status'
      )
      .orderBy('bookings.created_at', 'desc');

    res.status(200).json(bookings);
  } catch (error) {
    console.error('User Bookings Error:', error);
    res.status(500).json({ message: 'Error fetching user bookings' });
  }
};
