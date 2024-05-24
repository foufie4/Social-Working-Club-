const bcrypt = require('bcryptjs');

const password = 'Br10ch3';

async function testBcrypt() {
    try {
        // Générer le hachage
        const hash = await bcrypt.hash(password, 10);
        console.log(`Generated hash: ${hash}`);
        
        // Comparer le mot de passe avec le hachage
        const isValid = await bcrypt.compare(password, hash);
        console.log(`Password comparison result: ${isValid}`);
        
        console.log(`Password: ${password}`);
        console.log(`Password length: ${password.length}`);
        console.log(`Password in hex: ${Buffer.from(password, 'utf-8').toString('hex')}`);
        console.log(`Stored hash: ${hash}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

testBcrypt();