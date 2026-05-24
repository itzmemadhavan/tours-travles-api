/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('tour_packages', table => {
    table.renameColumn('title', 'package_name');
    table.renameColumn('image', 'thumbnail');
    
    // We cannot easily alter type from integer to string in some DBs without raw queries, 
    // but in MySQL alter is supported via raw or specialized knex methods.
    // Instead of dropping duration (which would drop data), we'll add a new column and drop the old later if needed, 
    // but since it's just a dev DB with mock data, let's just drop and recreate it.
    table.dropColumn('duration');
  }).then(() => {
    return knex.schema.alterTable('tour_packages', table => {
      table.string('duration').notNullable().defaultTo('N/A');
      table.string('category').defaultTo('General');
      table.text('gallery_images'); // JSON string
      table.text('inclusions');
      table.text('exclusions');
      table.decimal('rating', 3, 1).defaultTo(4.5);
      table.enum('status', ['active', 'inactive']).defaultTo('active');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('tour_packages', table => {
    table.renameColumn('package_name', 'title');
    table.renameColumn('thumbnail', 'image');
    table.dropColumn('category');
    table.dropColumn('gallery_images');
    table.dropColumn('inclusions');
    table.dropColumn('exclusions');
    table.dropColumn('rating');
    table.dropColumn('status');
    table.dropColumn('duration');
  }).then(() => {
    return knex.schema.alterTable('tour_packages', table => {
      table.integer('duration').notNullable().defaultTo(0);
    });
  });
};
