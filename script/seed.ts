import { db } from '../server/db';
import { users, accounts, transactions, services, appSettings } from '../shared/schema';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱 Iniciando seeding de base de datos...');

  try {
    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'admin',
      password: adminPassword,
      name: 'Kirito Admin',
      email: 'kirito108383@gmail.com',
      document: '1083831234',
      phone: '+573208646620',
      isAdmin: 1,
    }).onConflictDoNothing();

    // Crear usuario de prueba
    const userPassword = await bcrypt.hash('user123', 10);
    await db.insert(users).values({
      username: '1083831234',
      password: userPassword,
      name: 'Usuario Kirito',
      email: 'usuario@kirito.com',
      document: '1083831234',
      phone: '+573001234567',
      isAdmin: 0,
    }).onConflictDoNothing();

    // Crear cuenta para el usuario de prueba
    await db.insert(accounts).values({
      userId: 2, // ID del usuario de prueba
      accountNumber: '1083831234567890',
      accountType: 'Ahorros',
      balance: 2000000.00,
      status: 'active',
      currency: 'COP',
    }).onConflictDoNothing();

    // Crear servicios de pago
    await db.insert(services).values([
      { name: 'Electricidad', category: 'electricity', description: 'Pago de servicios eléctricos' },
      { name: 'Agua', category: 'water', description: 'Pago de servicios de acueducto' },
      { name: 'Teléfono', category: 'phone', description: 'Pago de servicios telefónicos' },
      { name: 'Internet', category: 'internet', description: 'Pago de servicios de internet' },
    ]).onConflictDoNothing();

    // Crear configuraciones de aplicación
    await db.insert(appSettings).values([
      { key: 'support_phone', value: '+573208646620', description: 'Número de teléfono de soporte' },
      { key: 'mobile_app_enabled', value: 'true', description: 'Habilitar instalación PWA' },
      { key: 'checkout_brand_name', value: 'Davivienda', description: 'Nombre de marca para checkout' },
      { key: 'checkout_brand_tagline', value: 'Banca en Línea Segura', description: 'Tagline para checkout' },
      { key: 'checkout_owner_name', value: 'Davivienda', description: 'Nombre del propietario' },
    ]).onConflictDoNothing();

    // Crear algunas transacciones de ejemplo
    await db.insert(transactions).values([
      {
        accountId: 1,
        amount: 1000000.00,
        description: 'Depósito inicial personalizado',
        type: 'deposit',
        date: new Date('2024-05-01'),
      },
      {
        accountId: 1,
        amount: -300000.00,
        description: 'Pago de servicios Kirito',
        type: 'payment',
        date: new Date('2024-05-05'),
      },
      {
        accountId: 1,
        amount: -200000.00,
        description: 'Transferencia personal',
        type: 'transfer',
        date: new Date('2024-05-10'),
      },
    ]).onConflictDoNothing();

    console.log('✅ Base de datos inicializada correctamente');
    console.log('');
    console.log('🔐 Credenciales de acceso:');
    console.log('Admin: admin / admin123');
    console.log('Usuario: 1083831234 / user123');
    console.log('');
    console.log('🚀 ¡La aplicación está lista para usar!');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedDatabase();