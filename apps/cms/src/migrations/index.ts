import * as migration_20261102_160313_initial from './20261102_160313_initial';

export const migrations = [
  {
    up: migration_20261102_160313_initial.up,
    down: migration_20261102_160313_initial.down,
    name: '20261102_160313_initial'
  },
];
