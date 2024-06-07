CREATE TABLE theme (
  id SERIAL PRIMARY KEY,
  theme text NOT NULL UNIQUE,
  active boolean default FALSE,
  created_at timestamptz default CURRENT_TIMESTAMP,
  created_by text NOT NULL
);

CREATE TABLE default_value (
  id SERIAL PRIMARY KEY,
  value text NOT NULL UNIQUE,
  active boolean default FALSE,
  created_at timestamptz default CURRENT_TIMESTAMP
);

ALTER TABLE theme
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE default_value 
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;