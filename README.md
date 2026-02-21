# Card-clash
capstone

## Database Setup
(I suggest installing pgadmin and handling the database from there rather than command line)
1. Install PostgreSQL (Make sure to add to PATH)
2. createdb card_clash
3. psql -U postgres -d card_clash -f backend/config/schema.sql
              ^        
           username