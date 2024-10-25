<!-- users -->
CREATE TABLE users (                         
    institute_email VARCHAR(255) PRIMARY KEY,        
    password VARCHAR(255) NOT NULL,                       
    role VARCHAR(50) CHECK (role IN ('student', 'coordinator', 'admin')) DEFAULT 'student',
    profile VARCHAR(10)                                       
);

<!-- Add foreign key from students to users -->
ALTER TABLE users
ADD CONSTRAINT fk_profile
FOREIGN KEY (profile) REFERENCES students(enrollment_no);

<!-- otps -->
CREATE TABLE otps (
    email VARCHAR(255) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    otp VARCHAR(500) NOT NULL,              
    expires_at TIMESTAMP NOT NULL         
);


<!-- students -->
CREATE TABLE students (
    enrollment_no VARCHAR(10) PRIMARY KEY,                       
    first_name VARCHAR(50) NOT NULL,                            
    last_name VARCHAR(50) NOT NULL,                              
    gender VARCHAR(6) NOT NULL CHECK (gender IN ('Male', 'Female')),  
    department VARCHAR(5) NOT NULL CHECK (department IN ('IET', 'IIPS', 'SCSIT', 'SDSF', 'SOCS')),
    course VARCHAR(10) NOT NULL,                                
    branch VARCHAR(10) NOT NULL CHECK (branch IN ('CS', 'IT', 'ETC', 'EI', 'Mechanical', 'Civil')),  
    date_of_birth DATE NOT NULL,                                 
    year_of_passing INTEGER NOT NULL 
    personal_email VARCHAR(100) NOT NULL UNIQUE,                 
    contact_no VARCHAR(15) NOT NULL UNIQUE,                      
    tenth_percentage NUMERIC(5,2) NOT NULL,                      
    twelfth_percentage NUMERIC(5,2) CHECK (twelfth_percentage IS NOT NULL OR diploma_cgpa IS NOT NULL),
    diploma_cgpa NUMERIC(3,2) CHECK (diploma_cgpa IS NOT NULL OR twelfth_percentage IS NOT NULL),  
    ug_cgpa NUMERIC(3,2) NOT NULL,                               
    pg_cgpa NUMERIC(3,2),                                        
    total_backlogs INTEGER NOT NULL,                             
    active_backlogs INTEGER NOT NULL                 
);


<!-- companies -->
CREATE TABLE companies (
    company_name VARCHAR(500) NOT NULL,                              
    role VARCHAR(500) NOT NULL,                                       
    ctc NUMERIC(10, 2) NOT NULL,                                      
    location VARCHAR[] NOT NULL,                                      
    description TEXT,                                        
    docs_attached VARCHAR(255),                                       
    deadline TIMESTAMP NOT NULL,                                      
    eligible_department VARCHAR[] NOT NULL,                           
    eligible_branch VARCHAR[] NOT NULL DEFAULT ARRAY['CS', 'IT', 'ETC', 'EI', 'Mechanical', 'Civil'], 
    tenth_percentage NUMERIC(5,2) NOT NULL DEFAULT 60,                
    twelfth_percentage NUMERIC(5,2) NOT NULL DEFAULT 60,              
    diploma_cgpa NUMERIC(3,2) NOT NULL DEFAULT 6,                     
    ug_cgpa NUMERIC(3,2) NOT NULL DEFAULT 6,                          
    pg_cgpa NUMERIC(3,2) NOT NULL DEFAULT 6,                          
    PRIMARY KEY (company_name, role)                                  
);


<!-- delete otps as expires_at timestamp becomes now -->