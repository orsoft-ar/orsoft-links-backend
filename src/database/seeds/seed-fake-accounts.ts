/**
 * Seed 100 cuentas demo diversas para orsoft-links
 * Uso: npx ts-node src/database/seeds/seed-fake-accounts.ts [--clean] [--count=100]
 * - Crea usuarios con email @seed.orsoft.local (identificable para limpieza)
 * - Cada cuenta tiene LinkPage pública + 3-5 links
 * - Idempotente si se usa --clean primero (borra previos seed)
 *
 * ADVERTENCIA: Son cuentas DEMO para poblar el sitemap y mostrar actividad.
 * Se recomienda marcarlas como demo en el frontend (badge) o borrarlas antes de prod real.
 */
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { User } from '../../users/entities/user.entity';
import { LinkPage } from '../../link-pages/entities/link-page.entity';
import { Link } from '../../links/entities/link.entity';
import { normalizeUsername } from '../../common/utils/username.utils';

const COUNT = Number(process.argv.find((a) => a.startsWith('--count='))?.split('=')[1] ?? 100);
const CLEAN = process.argv.includes('--clean');

type Rubro = {
  slug: string;
  label: string;
  titles: string[];
  descriptions: string[];
  linkTemplates: Array<{ title: string; icon: string; url: (u: string) => string }>;
};

const RUBROS: Rubro[] = [
  {
    slug: 'gastro',
    label: 'Gastronomía',
    titles: ['Café Martínez', 'La Posta Parrilla', 'Sushi Nikkai', 'Pizzería Don Luis', 'Helados Verona'],
    descriptions: ['Café de especialidad y brunch', 'Parrilla al carbón desde 1998', 'Omakase y sushi fusión', 'Horno a leña, masa madre', 'Helado artesanal'],
    linkTemplates: [
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'WhatsApp Reservas', icon: 'whatsapp', url: () => `https://wa.me/5493537661000` },
      { title: 'Carta / Menú', icon: 'globe', url: (u) => `https://${u}.orsoft.site/menu` },
      { title: 'Pedidos Ya', icon: 'shopping', url: (u) => `https://pedidosya.com/${u}` },
    ],
  },
  {
    slug: 'fitness',
    label: 'Fitness & Salud',
    titles: ['CrossFit Córdoba', 'Pilates Luján', 'Gym Fuerza Total', 'Yoga Espacio Ser', 'Funcional 360'],
    descriptions: ['Entrená sin límites', 'Pilates reformer y mat', 'Gym 24/7, músculo y cardio', 'Yoga y meditación', 'Funcional al aire libre'],
    linkTemplates: [
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Turnos WhatsApp', icon: 'whatsapp', url: () => `https://wa.me/5493537661001` },
      { title: 'Clases / Horarios', icon: 'calendar', url: (u) => `https://${u}.orsoft.site/horarios` },
      { title: 'TikTok', icon: 'music', url: (u) => `https://tiktok.com/@${u}` },
    ],
  },
  {
    slug: 'musica',
    label: 'Música',
    titles: ['DJ Luna Park', 'Banda La Roca', 'Estudio Sonoro', 'Clases de Guitarra Max', 'Prod. Jota Beats'],
    descriptions: ['DJ para eventos', 'Rock cover 80/90', 'Grabación y mezcla', 'Clases online y presenciales', 'Beats y producción urbana'],
    linkTemplates: [
      { title: 'YouTube', icon: 'youtube', url: (u) => `https://youtube.com/@${u}` },
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Spotify', icon: 'music', url: (u) => `https://open.spotify.com/artist/${u}` },
      { title: 'WhatsApp Contrataciones', icon: 'whatsapp', url: () => `https://wa.me/5493537661002` },
    ],
  },
  {
    slug: 'diseno',
    label: 'Diseño & Creativo',
    titles: ['Estudio Nómade', 'Brand Lab', 'Foto Urbana', 'Ilustra Sofi', 'UX Crew'],
    descriptions: ['Branding y packaging', 'Identidad visual', 'Fotografía producto y retrato', 'Ilustración digital', 'Diseño UX/UI para apps'],
    linkTemplates: [
      { title: 'Behance', icon: 'globe', url: (u) => `https://behance.net/${u}` },
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Portfolio', icon: 'globe', url: (u) => `https://${u}.orsoft.site` },
      { title: 'LinkedIn', icon: 'linkedin', url: (u) => `https://linkedin.com/in/${u}` },
    ],
  },
  {
    slug: 'tech',
    label: 'Tecnología',
    titles: ['OrSoft Dev', 'ByteHouse', 'Cloud Nine', 'AppFactory', 'DataPulse'],
    descriptions: ['Software a medida', 'Desarrollo web & mobile', 'Infra cloud', 'Apps a medida', 'Analytics y datos'],
    linkTemplates: [
      { title: 'Sitio Web', icon: 'globe', url: (u) => `https://${u}.orsoft.site` },
      { title: 'LinkedIn', icon: 'linkedin', url: (u) => `https://linkedin.com/company/${u}` },
      { title: 'GitHub', icon: 'github', url: (u) => `https://github.com/${u}` },
      { title: 'WhatsApp', icon: 'whatsapp', url: () => `https://wa.me/5493537661003` },
    ],
  },
  {
    slug: 'edu',
    label: 'Educación',
    titles: ['Academia Inglés Go', 'Matemáticas Fácil', 'Curso Barbería', 'Profe Meli', 'Aula Virtual 360'],
    descriptions: ['Inglés para adultos', 'Apoyo escolar', 'Barbería profesional', 'Clases particulares', 'Cursos online'],
    linkTemplates: [
      { title: 'WhatsApp Inscripciones', icon: 'whatsapp', url: () => `https://wa.me/5493537661004` },
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Programa del curso', icon: 'globe', url: (u) => `https://${u}.orsoft.site/programa` },
    ],
  },
  {
    slug: 'moda',
    label: 'Moda & Estética',
    titles: ['Ámbar Showroom', 'Barbería Urbano', 'Nails Luli', 'Moda Circular', 'Estética Bella'],
    descriptions: ['Showroom mujer', 'Barbería clásica', 'Nails y pestañas', 'Ropa second hand curada', 'Estética integral'],
    linkTemplates: [
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Tienda Online', icon: 'shopping', url: (u) => `https://${u}.orsoft.site/tienda` },
      { title: 'WhatsApp Turnos', icon: 'whatsapp', url: () => `https://wa.me/5493537661005` },
    ],
  },
  {
    slug: 'foto',
    label: 'Fotografía',
    titles: ['Foto Ana García', 'Bodas Eternas', 'Producto Studio', 'Drone Vistas', 'Retrato Natural'],
    descriptions: ['Sesiones naturales', 'Bodas y 15 años', 'Foto producto e-commerce', 'Tomas aéreas', 'Retrato profesional'],
    linkTemplates: [
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Portfolio', icon: 'globe', url: (u) => `https://${u}.orsoft.site` },
      { title: 'WhatsApp', icon: 'whatsapp', url: () => `https://wa.me/5493537661006` },
    ],
  },
  {
    slug: 'salud',
    label: 'Salud',
    titles: ['Consultorio Dra. Paz', 'Kinesio Salud', 'Nutri Vida', 'Psico Espacio', 'Odonto Sonrisas'],
    descriptions: ['Medicina clínica', 'Kinesiología y rehab', 'Nutrición personalizada', 'Psicología', 'Odontología integral'],
    linkTemplates: [
      { title: 'Turnos WhatsApp', icon: 'whatsapp', url: () => `https://wa.me/5493537661007` },
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
      { title: 'Ubicación', icon: 'map', url: (u) => `https://maps.google.com/?q=${u}` },
    ],
  },
  {
    slug: 'inmo',
    label: 'Inmobiliaria',
    titles: ['Inmo Centro', 'Propiedades Sur', 'Alquileres Ya', 'Terrenos Villa', 'Casa Propia'],
    descriptions: ['Venta y alquiler', 'Tasaciones', 'Alquileres temporarios', 'Lotes y terrenos', 'Tu próxima casa'],
    linkTemplates: [
      { title: 'Propiedades', icon: 'globe', url: (u) => `https://${u}.orsoft.site/propiedades` },
      { title: 'WhatsApp', icon: 'whatsapp', url: () => `https://wa.me/5493537661008` },
      { title: 'Instagram', icon: 'instagram', url: (u) => `https://instagram.com/${u}` },
    ],
  },
];

const FIRST_NAMES = ['Sofi','Mateo','Luna','Tomi','Valu','Juli','Cami','Nico','Flor','Gonza','Meli','Fran','Ana','Diego','Luz','Paz','Santi','Ema','Vicky','Juan'];
const LAST_NAMES = ['García','Pérez','López','Martínez','Gómez','Rodríguez','Fernández','Sosa','Rossi','Luna','Díaz','Torres','Ramírez','Villa','Castro'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}
function slugify(s: string): string {
  return normalizeUsername(s.replace(/\s+/g, '-').toLowerCase()).replace(/[^a-z0-9_-]/g, '') || 'demo';
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error','warn','log'] });
  const config = app.get(ConfigService);
  const dataSource = app.get(DataSource);
  const saltRounds = Number(config.get('BCRYPT_SALT_ROUNDS', 10));

  console.log(`\n🌱 Seed fake accounts — count=${COUNT} clean=${CLEAN}`);
  console.log(`DB: ${config.get('DATABASE_URL') ? 'DATABASE_URL' : `${config.get('DB_HOST')}:${config.get('DB_PORT')}/${config.get('DB_DATABASE')}`}`);

  if (CLEAN) {
    console.log('🧹 Borrando cuentas seed previas (@seed.orsoft.local)...');
    await dataSource.transaction(async (m) => {
      // Borra en orden por FK (tabla real es "users")
      await m.query(`DELETE FROM "links" WHERE "linkPageId" IN (SELECT id FROM "link_pages" WHERE "userId" IN (SELECT id FROM "users" WHERE email LIKE '%@seed.orsoft.local'))`);
      await m.query(`DELETE FROM "link_pages" WHERE "userId" IN (SELECT id FROM "users" WHERE email LIKE '%@seed.orsoft.local')`);
      await m.query(`DELETE FROM "users" WHERE email LIKE '%@seed.orsoft.local'`);
    });
    console.log('✓ Clean done');
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < COUNT; i++) {
    const rubro = pick(RUBROS, i);
    const titleBase = pick(rubro.titles, Math.floor(i / RUBROS.length));
    const descBase = pick(rubro.descriptions, Math.floor(i / RUBROS.length));
    const first = pick(FIRST_NAMES, i);
    const last = pick(LAST_NAMES, i*3);
    const baseSlug = slugify(`${rubro.slug}-${titleBase}-${i+1}`.toLowerCase());
    // Asegura 3-30 y único
    const username = normalizeUsername(baseSlug).slice(0, 30).replace(/-+$/, '') || `demo-${i}`;
    const email = `${username}@seed.orsoft.local`;
    const title = `${titleBase} ${first}`;
    const description = `${descBase} · ${rubro.label} · Cuenta demo ${i+1}/100 — ejemplo para mostrar linkorsoft.site`;
    const profileImageUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}`;

    try {
      // Check existente
      const existsUser = await dataSource.getRepository(User).findOne({ where: [{ username }, { email }] });
      if (existsUser) { skipped++; continue; }
      const existsPage = await dataSource.getRepository(LinkPage).findOne({ where: { username } });
      if (existsPage) { skipped++; continue; }

      const hash = await bcrypt.hash(`Demo${i}Seed!`, saltRounds);
      const user = dataSource.getRepository(User).create({
        username,
        email,
        password: hash,
        enabled: true,
      });
      const savedUser = await dataSource.getRepository(User).save(user);

      const page = dataSource.getRepository(LinkPage).create({
        userId: savedUser.id,
        username,
        title,
        description,
        profileImageUrl,
        isPublic: true,
      });
      const savedPage = await dataSource.getRepository(LinkPage).save(page);

      // 3-5 links
      const linkCount = 3 + (i % 3); // 3,4,5 cíclico
      const linkRepo = dataSource.getRepository(Link);
      for (let j = 0; j < linkCount; j++) {
        const tmpl = pick(rubro.linkTemplates, j);
        const link = linkRepo.create({
          linkPageId: savedPage.id,
          title: tmpl.title,
          url: tmpl.url(username),
          icon: tmpl.icon,
          position: j + 1,
          active: true,
        });
        await linkRepo.save(link);
      }

      created++;
      if (created % 10 === 0) console.log(`  ✓ ${created}/${COUNT} ${username} (${rubro.label})`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`  ✗ ${username}: ${msg}`);
      skipped++;
    }
  }

  console.log(`\n✅ Seed completo: ${created} creadas, ${skipped} omitidas`);
  console.log(`Sitemap: ${config.get('FRONTEND_URL') ?? 'https://linkorsoft.site'}/sitemap.xml`);
  console.log(`Prerender: corre "npm run build" en frontend para generar /:username estáticos`);
  console.log(`Limpieza: npx ts-node src/database/seeds/seed-fake-accounts.ts --clean --count=100`);
  await app.close();
  process.exit(0);
}

main().catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});
