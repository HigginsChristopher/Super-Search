// Importing necessary modules from Angular
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// UtilityService class provides utility methods for common tasks
export class UtilityService {

  // Constructor for the service
  constructor() { }

  // Method to get validation error messages from a form
  getFormValidationErrors(form: FormGroup): string[] {
    const errorMessages: string[] = [];
    // Mapping of common validation errors
    const errorMapping: { [key: string]: string } = {
      required: 'is required'
    };
    // Loop through form controls to check for errors
    Object.keys(form.controls).forEach(key => {
      const controlErrors = form.get(key)!.errors;
      if (controlErrors != null) {
        // Loop through control errors and construct error messages
        Object.keys(controlErrors).forEach(keyError => {
          const message = `${key.charAt(0).toUpperCase() + key.slice(1)} ${errorMapping[keyError as keyof typeof errorMapping]}`;
          errorMessages.push(message);
        });
      }
    });
    return errorMessages;
  }

  // Method to validate an email using a regular expression
  validateEmail(email: string): boolean {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  // Method to convert a timestamp to a formatted date string
  timestampToDate(timestamp: any): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }
}
