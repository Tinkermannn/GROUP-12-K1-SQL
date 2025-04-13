CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS stores(
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 name VARCHAR(255) NOT NULL,
 address VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 name VARCHAR(255) NOT NULL,
 email VARCHAR(255)     UNIQUE NOT NULL,
 password VARCHAR(255) NOT NULL,
 balance INT DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items(
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 name VARCHAR(255) NOT NULL,
 price INT NOT NULL,
 store_id UUID NOT NULL,
 image_url VARCHAR(255),
 stock INT DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE type transaction_status AS ENUM ('pending', 'paid');
CREATE TABLE IF NOT EXISTS transactions(
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id UUID NOT NULL,
 item_id UUID NOT NULL,
 quantity INT NOT NULL,
 total INT NOT NULL,
 status transaction_status DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

  SELECT
      t.id,
      t.user_id,
      t.item_id,
      t.quantity,
      t.total,
      t.status,
      t.created_at,
      row_to_json(u.*) AS "user",
      row_to_json(i.*) AS "item"
    FROM transactions t
    JOIN users u   ON u.id = t.user_id
    JOIN items i   ON i.id = t.item_id
    ORDER BY t.created_at;