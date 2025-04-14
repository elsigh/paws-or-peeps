-- Migration to add target_animal_type column to the images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS target_animal_type VARCHAR(20);

-- Add constraint to ensure target_animal_type is a valid animal type
ALTER TABLE images ADD CONSTRAINT images_target_animal_type_check 
CHECK (
  target_animal_type IS NULL OR 
  target_animal_type IN (
    'cat', 'dog', 'bird', 'horse', 'elephant', 
    'lion', 'tiger', 'bear', 'deer', 'wolf',
    'dolphin', 'whale', 'monkey', 'giraffe', 'zebra', 
    'penguin', 'fox', 'rabbit', 'squirrel', 'koala'
  )
);

-- Add updated_at column if it doesn't exist
ALTER TABLE images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Set default value for updated_at to be the same as created_at for existing records
UPDATE images SET updated_at = created_at WHERE updated_at IS NULL;

-- Add trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
BEFORE UPDATE ON images
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();