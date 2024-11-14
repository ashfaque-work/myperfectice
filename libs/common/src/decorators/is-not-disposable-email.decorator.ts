import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { BlockEmail } from '../components/blockEmail';

@ValidatorConstraint({ name: 'isNotDisposableEmail', async: false })
export class IsNotDisposableEmailConstraint implements ValidatorConstraintInterface {
  validate(email: any, args: ValidationArguments) {
    return BlockEmail.validate(email);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must not be a disposable email address`;
  }
}

export function IsNotDisposableEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotDisposableEmailConstraint,
    });
  };
}
