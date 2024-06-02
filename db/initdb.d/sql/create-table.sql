CREATE TABLE theme (
  id SERIAL PRIMARY KEY,
  theme text NOT NULL UNIQUE,
  active boolean default FALSE NOT NULL,
  created_at timestamptz default CURRENT_TIMESTAMP NOT NULL,
  created_by text NOT NULL
);

CREATE TABLE default_value (
  id SERIAL PRIMARY KEY,
  value text NOT NULL UNIQUE,
  active boolean default FALSE NOT NULL,
  created_at timestamptz default CURRENT_TIMESTAMP NOT NULL
);