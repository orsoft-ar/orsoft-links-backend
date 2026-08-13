import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

const HTTP_URL_RE = /^https?:\/\/.+/;
const MAILTO_RE = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_RE = /^tel:\+?[0-9][0-9\s\-()]*$/;

@ValidatorConstraint({ name: 'isLinkUrl', async: false })
export class IsLinkUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || value.length === 0) return false;
    return HTTP_URL_RE.test(value) || MAILTO_RE.test(value) || TEL_RE.test(value);
  }

  defaultMessage(): string {
    return 'La URL debe ser http://, https://, mailto: o tel: valida';
  }
}

export function IsLinkUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLinkUrlConstraint,
    });
  };
}
