import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { normalizeUsername } from '../utils/username.utils';

export function IsUsername(optional = false) {
  return function (target: object, propertyKey: string) {
    if (optional) IsOptional()(target, propertyKey);
    Transform(({ value }) => (typeof value === 'string' ? normalizeUsername(value) : value))(
      target,
      propertyKey,
    );
    IsString()(target, propertyKey);
    if (!optional) IsNotEmpty()(target, propertyKey);
    Length(3, 30, { message: 'El nombre de usuario debe tener entre 3 y 30 caracteres' })(
      target,
      propertyKey,
    );
    Matches(/^[a-z0-9_-]+$/, {
      message: 'El nombre de usuario solo puede contener letras, numeros, _ y -',
    })(target, propertyKey);
  };
}
