/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('phone');
      table.string('password').notNullable(); // No hashing for now as per user request
      table.enum('role', ['admin', 'agent', 'user']).defaultTo('user');
      table.timestamps(true, true);
    })
    .createTable('tour_packages', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('destination').notNullable();
      table.text('description');
      table.decimal('price', 10, 2).notNullable();
      table.integer('duration').notNullable(); // in days
      table.string('image');
      table.integer('available_slots').notNullable().defaultTo(0);
      table.timestamps(true, true);
    })
    .createTable('bookings', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('package_id').unsigned().references('id').inTable('tour_packages').onDelete('CASCADE');
      table.date('travel_date').notNullable();
      table.integer('travelers_count').notNullable().defaultTo(1);
      table.decimal('total_amount', 10, 2).notNullable();
      table.enum('payment_status', ['pending', 'completed', 'failed', 'refunded']).defaultTo('pending');
      table.enum('booking_status', ['pending', 'confirmed', 'cancelled']).defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('reviews', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('package_id').unsigned().references('id').inTable('tour_packages').onDelete('CASCADE');
      table.integer('rating').notNullable().checkBetween([1, 5]);
      table.text('comment');
      table.timestamps(true, true);
    })
    .createTable('payments', table => {
      table.increments('id').primary();
      table.integer('booking_id').unsigned().references('id').inTable('bookings').onDelete('CASCADE');
      table.string('transaction_id');
      table.decimal('amount', 10, 2).notNullable();
      table.string('payment_method');
      table.enum('payment_status', ['pending', 'completed', 'failed']).defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('uploaded_files', table => {
      table.increments('id').primary();
      table.string('file_name').notNullable();
      table.string('file_url').notNullable();
      table.string('file_type').notNullable();
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('uploaded_files')
    .dropTableIfExists('payments')
    .dropTableIfExists('reviews')
    .dropTableIfExists('bookings')
    .dropTableIfExists('tour_packages')
    .dropTableIfExists('users');
};
