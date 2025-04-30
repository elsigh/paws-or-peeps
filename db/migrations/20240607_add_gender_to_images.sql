-- Add a nullable gender column to the images table
ALTER TABLE images
ADD COLUMN gender TEXT NULL; 