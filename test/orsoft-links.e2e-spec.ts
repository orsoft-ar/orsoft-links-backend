import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { globalValidationPipe, testImports, testProviders } from './test-module';

describe('OrSoft Links API (e2e)', () => {
  let app: INestApplication;

  const registerUser = async (username: string, email: string, password = 'secret123') => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ username, email, password });
  };

  const createPage = (token: string, body: object) =>
    request(app.getHttpServer())
      .post('/api/link-pages')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const createLink = (token: string, body: object) =>
    request(app.getHttpServer())
      .post('/api/link-pages/me/links')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: testImports,
      providers: testProviders,
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(globalValidationPipe);
    await app.init();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  describe('Auth', () => {
    it('31. registra un usuario y devuelve token', async () => {
      const res = await registerUser('mateo', 'mateo@test.com');
      expect(res.status).toBe(201);
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user).toMatchObject({ username: 'mateo', email: 'mateo@test.com' });
      expect(res.body.user.password).toBeUndefined();
    });

    it('32. no permite registrar email duplicado', async () => {
      await registerUser('mateo', 'mateo@test.com');
      const res = await registerUser('otro', 'mateo@test.com');
      expect(res.status).toBe(409);
    });

    it('33. no permite username reservado', async () => {
      const res = await registerUser('admin', 'admin@test.com');
      expect(res.status).toBe(400);
    });

    it('34. no permite username invalido con espacios', async () => {
      const res = await registerUser('Mateo Gerbaudo', 'mg@test.com');
      expect(res.status).toBe(400);
    });

    it('35. login correcto devuelve token', async () => {
      await registerUser('mateo', 'mateo@test.com');
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'mateo@test.com', password: 'secret123' });
      expect(res.status).toBe(200);
      expect(res.body.access_token).toBeDefined();
    });

    it('36. login con password incorrecto da 401', async () => {
      await registerUser('mateo', 'mateo@test.com');
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'mateo@test.com', password: 'incorrecta' });
      expect(res.status).toBe(401);
    });
  });

  describe('LinkPage', () => {
    let token: string;

    beforeEach(async () => {
      const res = await registerUser('mateo', 'mateo@test.com');
      token = res.body.access_token;
    });

    it('1. crea una pagina de links', async () => {
      const res = await createPage(token, {
        username: 'mateo',
        title: 'Mateo Gerbaudo',
        description: 'Desarrollador Full Stack',
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        username: 'mateo',
        title: 'Mateo Gerbaudo',
        isPublic: true,
      });
    });

    it('2. no permite username duplicado entre paginas', async () => {
      await createPage(token, { username: 'mateo', title: 'Mateo' });
      const other = await registerUser('juan', 'juan@test.com');
      const res = await createPage(other.body.access_token, { username: 'mateo', title: 'Juan' });
      expect(res.status).toBe(409);
    });

    it('3. obtiene mi pagina', async () => {
      await createPage(token, { username: 'mateo', title: 'Mateo' });
      const res = await request(app.getHttpServer())
        .get('/api/link-pages/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('mateo');
    });

    it('4. actualiza mi pagina', async () => {
      await createPage(token, { username: 'mateo', title: 'Mateo' });
      const res = await request(app.getHttpServer())
        .put('/api/link-pages/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Mateo G.', isPublic: false });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'Mateo G.', isPublic: false });
    });

    it('5. elimina mi pagina', async () => {
      await createPage(token, { username: 'mateo', title: 'Mateo' });
      const res = await request(app.getHttpServer())
        .delete('/api/link-pages/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ deleted: true });
      const after = await request(app.getHttpServer())
        .get('/api/link-pages/me')
        .set('Authorization', `Bearer ${token}`);
      expect(after.status).toBe(404);
    });

    it('6. no permite crear dos paginas para el mismo usuario', async () => {
      await createPage(token, { username: 'mateo', title: 'Mateo' });
      const res = await createPage(token, { username: 'mateo2', title: 'Otra' });
      expect(res.status).toBe(409);
    });

    it('10. recorta username a minusculas', async () => {
      const res = await createPage(token, { username: 'MATEO', title: 'Mateo' });
      expect(res.status).toBe(201);
      expect(res.body.username).toBe('mateo');
    });

    it('17. valida el username', async () => {
      const res = await createPage(token, { username: 'mateo.dev', title: 'Mateo' });
      expect(res.status).toBe(400);
    });
  });

  describe('Link', () => {
    let token: string;

    beforeEach(async () => {
      const res = await registerUser('mateo', 'mateo@test.com');
      token = res.body.access_token;
      await createPage(token, { username: 'mateo', title: 'Mateo' });
    });

    it('7. crea un link y asigna posicion automatica', async () => {
      const res = await createLink(token, {
        title: 'Mi Portfolio',
        url: 'https://ejemplo.com/portafolio/',
        icon: 'globe',
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Mi Portfolio',
        url: 'https://ejemplo.com/portafolio/',
        icon: 'globe',
        position: 1,
        active: true,
      });

      const second = await createLink(token, {
        title: 'GitHub',
        url: 'https://github.com/mateo',
      });
      expect(second.body.position).toBe(2);
    });

    it('16. valida la URL', async () => {
      const res = await createLink(token, {
        title: 'Bad',
        url: 'ftp://invalida.com',
      });
      expect(res.status).toBe(400);
    });

    it('8. edita un link', async () => {
      const created = await createLink(token, {
        title: 'Mi Portfolio',
        url: 'https://ejemplo.com/portafolio/',
      });
      const res = await request(app.getHttpServer())
        .put(`/api/link-pages/me/links/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Portfolio Actualizado' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Portfolio Actualizado');
    });

    it('9. elimina un link', async () => {
      const created = await createLink(token, {
        title: 'Mi Portfolio',
        url: 'https://ejemplo.com/portafolio/',
      });
      const res = await request(app.getHttpServer())
        .delete(`/api/link-pages/me/links/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const list = await request(app.getHttpServer())
        .get('/api/link-pages/me/links')
        .set('Authorization', `Bearer ${token}`);
      expect(list.body).toHaveLength(0);
    });

    it('11. activa/desactiva un link', async () => {
      const created = await createLink(token, {
        title: 'Mi Portfolio',
        url: 'https://ejemplo.com/portafolio/',
      });
      const res = await request(app.getHttpServer())
        .patch(`/api/link-pages/me/links/${created.body.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ active: false });
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });

    it('12. reordena los links', async () => {
      const a = await createLink(token, { title: 'A', url: 'https://a.com' });
      const b = await createLink(token, { title: 'B', url: 'https://b.com' });
      const c = await createLink(token, { title: 'C', url: 'https://c.com' });

      const res = await request(app.getHttpServer())
        .put('/api/link-pages/me/links/reorder')
        .set('Authorization', `Bearer ${token}`)
        .send({
          links: [
            { id: c.body.id, position: 1 },
            { id: a.body.id, position: 2 },
            { id: b.body.id, position: 3 },
          ],
        });
      expect(res.status).toBe(200);
      expect(res.body.map((l: { id: number; position: number }) => [l.id, l.position])).toEqual([
        [c.body.id, 1],
        [a.body.id, 2],
        [b.body.id, 3],
      ]);
    });

    it('13. no permite reordenar links ajenos', async () => {
      const a = await createLink(token, { title: 'A', url: 'https://a.com' });
      const other = await registerUser('juan', 'juan@test.com');
      await createPage(other.body.access_token, { username: 'juan', title: 'Juan' });

      const res = await request(app.getHttpServer())
        .put('/api/link-pages/me/links/reorder')
        .set('Authorization', `Bearer ${other.body.access_token}`)
        .send({ links: [{ id: a.body.id, position: 1 }] });
      expect(res.status).toBe(403);
    });

    it('18. no permite editar links de otro usuario', async () => {
      const created = await createLink(token, {
        title: 'Mi Portfolio',
        url: 'https://ejemplo.com/portafolio/',
      });
      const other = await registerUser('juan', 'juan@test.com');
      await createPage(other.body.access_token, { username: 'juan', title: 'Juan' });

      const res = await request(app.getHttpServer())
        .put(`/api/link-pages/me/links/${created.body.id}`)
        .set('Authorization', `Bearer ${other.body.access_token}`)
        .send({ title: 'Hackeado' });
      expect(res.status).toBe(403);
    });
  });

  describe('Public', () => {
    let token: string;

    beforeEach(async () => {
      const res = await registerUser('mateo', 'mateo@test.com');
      token = res.body.access_token;
      await createPage(token, {
        username: 'mateo',
        title: 'Mateo Gerbaudo',
        description: 'Desarrollador Full Stack',
        profileImageUrl: 'https://ejemplo.com/perfil.png',
      });
    });

    it('14. devuelve la pagina publica con links activos y ordenados', async () => {
      await createLink(token, { title: 'Portfolio', url: 'https://a.com', icon: 'globe' });
      await createLink(token, { title: 'GitHub', url: 'https://github.com/mateo', icon: 'github' });

      const inactive = await request(app.getHttpServer())
        .get('/api/link-pages/me/links')
        .set('Authorization', `Bearer ${token}`);
      const inactiveId = inactive.body[0].id;
      await request(app.getHttpServer())
        .patch(`/api/link-pages/me/links/${inactiveId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ active: false });

      const res = await request(app.getHttpServer()).get('/api/public/links/mateo');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        username: 'mateo',
        title: 'Mateo Gerbaudo',
        description: 'Desarrollador Full Stack',
        profileImageUrl: 'https://ejemplo.com/perfil.png',
      });
      expect(res.body.links).toHaveLength(1);
      expect(res.body.links[0]).toMatchObject({ title: 'GitHub', icon: 'github' });
      expect(res.body.email).toBeUndefined();
      expect(res.body.password).toBeUndefined();
      expect(res.body.userId).toBeUndefined();
    });

    it('15. pagina privada no es publica', async () => {
      await request(app.getHttpServer())
        .put('/api/link-pages/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ isPublic: false });

      const res = await request(app.getHttpServer()).get('/api/public/links/mateo');
      expect(res.status).toBe(404);
    });

    it('19. pagina inexistente da 404', async () => {
      const res = await request(app.getHttpServer()).get('/api/public/links/noexiste');
      expect(res.status).toBe(404);
    });
  });

  describe('Autorizacion', () => {
    it('20. endpoint protegido sin token da 401', async () => {
      const res = await request(app.getHttpServer()).get('/api/link-pages/me');
      expect(res.status).toBe(401);
    });

    it('21. endpoint publico no requiere token', async () => {
      const res = await request(app.getHttpServer()).get('/api/public/links/alguien');
      expect(res.status).toBe(404);
    });
  });
});