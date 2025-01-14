-- Create the locations table
CREATE TABLE locations (
    LocationID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    City VARCHAR(255) NOT NULL,
    Location VARCHAR(255) NOT NULL
);

-- Create the users table
CREATE TABLE users (
    OculusID VARCHAR(255) PRIMARY KEY, -- Changed to VARCHAR to store as a string
    OculusName VARCHAR(255) NOT NULL,
    Role TINYINT UNSIGNED NOT NULL,
    NameTag VARCHAR(255) NOT NULL,
    NetworkState TINYINT UNSIGNED NOT NULL,
    Muted BOOLEAN NOT NULL DEFAULT FALSE,
    Flag1 INT UNSIGNED DEFAULT 0,
    Flag2 INT UNSIGNED DEFAULT 0,
    Flag3 INT UNSIGNED DEFAULT 0,
    LocationID INT UNSIGNED,
    CONSTRAINT FK_LocationID FOREIGN KEY (LocationID) REFERENCES locations(LocationID)
);

-- Insert data into the locations table
INSERT INTO locations (City, Location)
VALUES
('Erfurt', 'FH Erfurt'),
('Frankfurt', 'Haüptbahnhof'),
('Berlin', 'Berghain');

-- Insert data into the users table
INSERT INTO users (OculusID, OculusName, Role, NameTag, NetworkState, Muted, Flag1, Flag2, Flag3, LocationID)
VALUES
('7509614242485511', 'XRUser123', 1, 'JohnDoe', 0, FALSE, 0, 0, 0, 1), -- OculusID is now a string
('7509614242485512', 'VRGamerX', 2, 'JaneDoe', 1, TRUE, 0, 0, 0, 2),
('7509614242485513', 'EliteUser42', 0, 'EliteTag', 0, FALSE, 0, 0, 0, 3);
