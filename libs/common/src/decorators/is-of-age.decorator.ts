import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';

@ValidatorConstraint({ async: false, name: 'IsOfAge' })
export class IsOfAgeConstraint implements ValidatorConstraintInterface {
  validate(birthDate: any, args: ValidationArguments) {
    if (birthDate === '' || birthDate === null || birthDate === undefined) {
      return true;
    }

    const today = new Date();
    const birthdate = new Date(birthDate);
    const ageDifMs = today.getTime() - birthdate.getTime();
    const ageDate = new Date(ageDifMs);
    return ageDate.getUTCFullYear() - 1970 >= 13;
  }

  defaultMessage(args: ValidationArguments) {
    return 'User must be at least 13 years old';
  }
}

export function IsOfAge(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOfAgeConstraint,
    });
  };
}
