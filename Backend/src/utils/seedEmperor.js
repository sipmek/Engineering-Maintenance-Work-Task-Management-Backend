const bcrypt = require('bcryptjs');
const { User } = require('../models');

const seedEmperor = async () => {
  try {
    const existing = await User.findOne({
      where: { role: 'emperor' }
    });

    if (existing) {
      console.log('[SEED] Emperor sudah ada');
      return;
    }

    const hashedPassword = await bcrypt.hash('masukinaja1234', 10);

    await User.create({
      username: 'emperor',
      email: 'sageromelsage@gmail.com',
      password: hashedPassword,
      role: 'emperor',
      status: 'active',
    });

    console.log('[SEED] Emperor berhasil dibuat!');
    console.log('Username: emperor');
    console.log('Password: admin123');

  } catch (err) {
    console.error('[SEED ERROR]', err.message);
  }
};

module.exports = seedEmperor;