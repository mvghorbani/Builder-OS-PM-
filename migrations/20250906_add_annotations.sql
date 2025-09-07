-- Create annotations table
CREATE TABLE annotations (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  page_number INTEGER NOT NULL,
  stamp_type VARCHAR(255),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create signatures table
CREATE TABLE signatures (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  preview VARCHAR(512) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create stamps table
CREATE TABLE stamps (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  preview VARCHAR(512) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create signing_sessions table
CREATE TABLE signing_sessions (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX annotations_document_id_idx ON annotations(document_id);
CREATE INDEX annotations_user_id_idx ON annotations(user_id);
CREATE INDEX signatures_user_id_idx ON signatures(user_id);
CREATE INDEX stamps_user_id_idx ON stamps(user_id);
CREATE INDEX signing_sessions_document_id_idx ON signing_sessions(document_id);
CREATE INDEX signing_sessions_user_id_idx ON signing_sessions(user_id);
