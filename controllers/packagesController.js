const db = require('../config/db');

// Get all packages (with optional search and category filters)
exports.getPackages = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = db('tour_packages');

    if (status && status !== 'all') {
      query = query.where({ status });
    }

    if (category && category !== 'All') {
      query = query.where({ category });
    }

    if (search) {
      query = query.andWhere((qb) => {
        qb.where('package_name', 'like', `%${search}%`)
          .orWhere('destination', 'like', `%${search}%`);
      });
    }

    query = query.orderBy('created_at', 'desc');
    const packages = await query;
    res.status(200).json(packages);
  } catch (error) {
    console.error('Fetch Packages Error:', error);
    res.status(500).json({ message: 'Server error fetching packages', error: error.message });
  }
};

// Get single package
exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await db('tour_packages').where({ id }).first();
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.status(200).json(pkg);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    const { package_name, destination, duration, price, description, category, thumbnail, inclusions, exclusions, rating, status } = req.body;

    if (!package_name || !destination || !price) {
      return res.status(400).json({ message: 'Package name, destination, and price are required' });
    }

    const [id] = await db('tour_packages').insert({
      package_name,
      destination,
      duration: duration || 'N/A',
      price,
      description,
      category: category || 'General',
      thumbnail,
      inclusions: inclusions ? JSON.stringify(inclusions) : null,
      exclusions: exclusions ? JSON.stringify(exclusions) : null,
      rating: rating || 4.5,
      status: status || 'active'
    });

    const newPackage = await db('tour_packages').where({ id }).first();
    res.status(201).json({ message: 'Package created successfully', package: newPackage });
  } catch (error) {
    console.error('Create Package Error:', error);
    res.status(500).json({ message: 'Server error creating package', error: error.message });
  }
};

// Update an existing package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { package_name, destination, duration, price, description, category, thumbnail, inclusions, exclusions, rating, status } = req.body;

    const pkg = await db('tour_packages').where({ id }).first();
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    await db('tour_packages').where({ id }).update({
      package_name: package_name || pkg.package_name,
      destination: destination || pkg.destination,
      duration: duration !== undefined ? duration : pkg.duration,
      price: price !== undefined ? price : pkg.price,
      description: description !== undefined ? description : pkg.description,
      category: category || pkg.category,
      thumbnail: thumbnail !== undefined ? thumbnail : pkg.thumbnail,
      inclusions: inclusions ? JSON.stringify(inclusions) : pkg.inclusions,
      exclusions: exclusions ? JSON.stringify(exclusions) : pkg.exclusions,
      rating: rating !== undefined ? rating : pkg.rating,
      status: status || pkg.status
    });

    const updatedPackage = await db('tour_packages').where({ id }).first();
    res.status(200).json({ message: 'Package updated successfully', package: updatedPackage });
  } catch (error) {
    console.error('Update Package Error:', error);
    res.status(500).json({ message: 'Server error updating package', error: error.message });
  }
};

// Delete a package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await db('tour_packages').where({ id }).first();
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    // Check if bookings exist for this package
    const bookingsCount = await db('bookings').where({ package_id: id }).count('id as count').first();
    if (bookingsCount.count > 0) {
      return res.status(400).json({ message: 'Cannot delete package. It has active bookings. Please set it to inactive instead.' });
    }

    await db('tour_packages').where({ id }).del();
    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete Package Error:', error);
    res.status(500).json({ message: 'Server error deleting package', error: error.message });
  }
};
