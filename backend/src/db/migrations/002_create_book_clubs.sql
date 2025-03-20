-- Create book_clubs table
CREATE TABLE IF NOT EXISTS book_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create book_club_members table
CREATE TABLE IF NOT EXISTS book_club_members (
    user_id UUID NOT NULL REFERENCES users(id),
    book_club_id UUID NOT NULL REFERENCES book_clubs(id),
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_club_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_book_club_members_user_id ON book_club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_book_club_members_book_club_id ON book_club_members(book_club_id); 