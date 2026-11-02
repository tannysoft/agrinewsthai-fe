import * as migration_20261102_160313_initial from './20261102_160313_initial';
import * as migration_20261102_182917_media_sizes_ready from './20261102_182917_media_sizes_ready';
import * as migration_20261102_184857_drop_wordpress_fields from './20261102_184857_drop_wordpress_fields';

export const migrations = [
  {
    up: migration_20261102_160313_initial.up,
    down: migration_20261102_160313_initial.down,
    name: '20261102_160313_initial',
  },
  {
    up: migration_20261102_182917_media_sizes_ready.up,
    down: migration_20261102_182917_media_sizes_ready.down,
    name: '20261102_182917_media_sizes_ready',
  },
  {
    up: migration_20261102_184857_drop_wordpress_fields.up,
    down: migration_20261102_184857_drop_wordpress_fields.down,
    name: '20261102_184857_drop_wordpress_fields'
  },
];
