import {
  isReservedUsername,
  isValidUsername,
  normalizeUsername,
} from './username.utils';

describe('username.utils', () => {
  describe('normalizeUsername', () => {
    it('devuelve el username en lowercase sin espacios', () => {
      expect(normalizeUsername('  Mateo Gerbaudo  ')).toBe('mateo gerbaudo');
      expect(normalizeUsername('MATEO')).toBe('mateo');
    });
  });

  describe('isValidUsername', () => {
    it('acepta usernames validos', () => {
      expect(isValidUsername('mateo')).toBe(true);
      expect(isValidUsername('mateo-gerbaudo')).toBe(true);
      expect(isValidUsername('mateo_dev')).toBe(true);
      expect(isValidUsername('orsoft')).toBe(true);
      expect(isValidUsername('alfamateriales')).toBe(true);
    });

    it('rechaza usernames con espacios, @ o puntos', () => {
      expect(isValidUsername('Mateo Gerbaudo')).toBe(false);
      expect(isValidUsername('mateo@dev')).toBe(false);
      expect(isValidUsername('mateo.dev')).toBe(false);
    });

    it('rechaza usernames demasiado cortos o largos', () => {
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('a'.repeat(31))).toBe(false);
    });
  });

  describe('isReservedUsername', () => {
    it('detecta usernames reservados', () => {
      for (const reserved of ['admin', 'api', 'orsoft', 'public', 'links']) {
        expect(isReservedUsername(reserved)).toBe(true);
      }
    });

    it('ignora mayusculas en usernames reservados', () => {
      expect(isReservedUsername('ADMIN')).toBe(true);
    });

    it('permite usernames normales', () => {
      expect(isReservedUsername('mateo')).toBe(false);
    });
  });
});