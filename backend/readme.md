<!-- users -->
CREATE TABLE users (  
    institute_email TEXT PRIMARY KEY,  
    password TEXT NOT NULL,  
    role VARCHAR(10) CHECK (role IN ('student', 'coordinator', 'admin')) DEFAULT 'student',
    profile_id VARCHAR(10)  
);

<!-- Add foreign key from students to users -->
ALTER TABLE users
ADD CONSTRAINT fk_profile FOREIGN KEY (profile)
REFERENCES students (enrollment_no)
ON DELETE SET NULL;

<!-- otps -->
CREATE TABLE otps (
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    otp TEXT NOT NULL,  
    expires_at TIMESTAMP NOT NULL  
);

<!-- students -->
CREATE TABLE students (
    enrollment_no VARCHAR(10) PRIMARY KEY,  
    first_name VARCHAR(50) NOT NULL,  
    last_name VARCHAR(50) NOT NULL,  
    image TEXT,
    gender VARCHAR(6) NOT NULL CHECK (gender IN ('Male', 'Female')),  
    college TEXT
    course TEXT NOT NULL,  
    branch VARCHAR(10) NOT NULL CHECK (branch IN ('CS', 'IT', 'ETC', 'EI', 'Mechanical', 'Civil')),  
    date_of_birth DATE NOT NULL,  
    year_of_passing INTEGER NOT NULL
    personal_email TEXT NOT NULL UNIQUE,  
    contact_no VARCHAR(15) NOT NULL UNIQUE,  
    tenth_percentage NUMERIC(5,2) NOT NULL,  
    twelfth_percentage NUMERIC(5,2) CHECK (twelfth_percentage IS NOT NULL OR diploma_cgpa IS NOT NULL),
    diploma_cgpa NUMERIC(3,2) CHECK (diploma_cgpa IS NOT NULL OR twelfth_percentage IS NOT NULL),  
    ug_cgpa NUMERIC(3,2) NOT NULL,  
    total_backlogs INTEGER NOT NULL,  
    active_backlogs INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Placed', 'Unplaced')) DEFAULT 'Unplaced'  
);

<!-- companies -->
CREATE TABLE companies (
    company_name TEXT NOT NULL,  
    role TEXT NOT NULL,  
    ctc NUMERIC(10, 2) NOT NULL,  
    location VARCHAR[] NOT NULL,  
    description TEXT,  
    docs_attached VARCHAR[],  
    deadline TIMESTAMP NOT NULL,  
    eligible_branch VARCHAR[] NOT NULL DEFAULT ARRAY['CS', 'IT', 'ETC', 'EI', 'Mechanical', 'Civil'],
    tenth_percentage NUMERIC(5,2) NOT NULL DEFAULT 60,  
    twelfth_percentage NUMERIC(5,2) NOT NULL DEFAULT 60,  
    diploma_cgpa NUMERIC(3,2) NOT NULL DEFAULT 6,  
    ug_cgpa NUMERIC(3,2) NOT NULL DEFAULT 6,
    data_file TEXT,
    status VARCHAR(20) CHECK (role IN ('Listed', 'In Process', 'Completed')) DEFAULT 'Listed',  
    PRIMARY KEY (company_name, role)  
);  

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    speaker_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT,
    link TEXT,
);

<!-- delete otps as expires_at timestamp becomes now -->
CREATE EXTENSION IF NOT EXISTS pg*cron;
    SELECT cron.schedule('delete_expired_otps', '*/10 \_ \* \* \*',
    $$DELETE FROM otps WHERE expires_at < NOW();$$
);


<!-- COMPANY -->
CREATE TABLE ${companyName} (
    enrollment_no VARCHAR(10),
    role TEXT,
    resume TEXT,
    status VARCHAR(20) CHECK (status IN ('Applied', 'Shortlisted', 'Selected', 'Rejected')) DEFAULT 'Applied',
    PRIMARY KEY (enrollment_no, role)
);
