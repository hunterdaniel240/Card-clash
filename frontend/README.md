# Card-clash

capstone

## Local Database Setup

(I suggest installing pgadmin and handling the database from there rather than command line)

1. Install PostgreSQL (Make sure to add to PATH)
2. createdb card_clash
3. psql -U postgres -d card_clash -f backend/config/schema.sql
   ^  
    username

## To run application

1. Open two terminal windows
2. In one terminal, cd /frontend
3. In the second terminal, cd /backend
4. In both terminals, npm run dev
5. enter "http://localhost:3000/" in your browser
