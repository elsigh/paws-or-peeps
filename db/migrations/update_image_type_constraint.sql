-- Migration to update the image_type constraint in the images table
ALTER TABLE images DROP CONSTRAINT IF EXISTS images_image_type_check;

-- Add the new constraint with all 22 possible values
ALTER TABLE images ADD CONSTRAINT images_image_type_check 
CHECK (image_type IN (
  'cat', 'dog', 'bird', 'horse', 'elephant', 
  'lion', 'tiger', 'bear', 'deer', 'wolf',
  'dolphin', 'whale', 'monkey', 'giraffe', 'zebra', 
  'penguin', 'fox', 'rabbit', 'squirrel', 'koala',
  'human', 'other'
));

-- Update any existing records with invalid types to 'other'
UPDATE images SET image_type = 'other' WHERE image_type NOT IN (
  'cat', 'dog', 'bird', 'horse', 'elephant', 
  'lion', 'tiger', 'bear', 'deer', 'wolf',
  'dolphin', 'whale', 'monkey', 'giraffe', 'zebra', 
  'penguin', 'fox', 'rabbit', 'squirrel', 'koala',
  'human', 'other'
);