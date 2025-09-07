-- Discussions feature: conversations, comments, reactions
-- Safe guards for repeated runs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
    CREATE TYPE reaction_type AS ENUM ('like','love','insight','question','celebrate');
  END IF;
END $$;

-- discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id              varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     varchar REFERENCES properties(id) ON DELETE SET NULL,
  author_id       varchar NOT NULL REFERENCES users(id),
  title           text,
  body            text NOT NULL,
  visibility      access_level NOT NULL DEFAULT 'project_team',
  is_pinned       boolean NOT NULL DEFAULT false,
  is_locked       boolean NOT NULL DEFAULT false,
  created_at      timestamp DEFAULT now(),
  updated_at      timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discussions_property_created ON discussions(property_id, created_at DESC);

-- discussion_comments table
CREATE TABLE IF NOT EXISTS discussion_comments (
  id                 varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id      varchar NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id            varchar NOT NULL REFERENCES users(id),
  body               text NOT NULL,
  parent_comment_id  varchar,
  created_at         timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_discussion ON discussion_comments(discussion_id, created_at ASC);

-- discussion_reactions table
CREATE TABLE IF NOT EXISTS discussion_reactions (
  id             varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id  varchar NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  user_id        varchar NOT NULL REFERENCES users(id),
  type           reaction_type NOT NULL DEFAULT 'like',
  created_at     timestamp DEFAULT now(),
  CONSTRAINT uq_discussion_reaction UNIQUE (discussion_id, user_id, type)
);
CREATE INDEX IF NOT EXISTS idx_discussion_reactions_discussion ON discussion_reactions(discussion_id);

