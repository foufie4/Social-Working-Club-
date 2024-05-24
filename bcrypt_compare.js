const bcrypt = require('bcryptjs');

const password = 'Br10ch3';
const storedHash = '$2a$10$M9.0sHQTV1NgKa.4NCmk7OnHmdbh0lFgPMC1giunGmO3jM2DnFFKW';

async function comparePassword() {
    try {
        console.log(`Stored hash: ${storedHash}`);
        console.log(`Password: ${password}`);
        console.log(`Password length: ${password.length}`);
        
        const isValid = await bcrypt.compare(password, storedHash);
        console.log(`Password comparison result: ${isValid}`);
    } catch (error) {
        console.error(`Error during comparison: ${error.message}`);
    }
}

comparePassword();