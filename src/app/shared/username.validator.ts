import { AbstractControl } from "@angular/forms";

export function usernameTester(control: AbstractControl): {[key: string]: any} | null {
    const forbidden = /harin23/.test(control.value);
    return forbidden ? { 'forbiddenName': {value: control.value}} : null;
}