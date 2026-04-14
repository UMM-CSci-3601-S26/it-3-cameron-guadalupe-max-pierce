import { Student } from './student';

export interface Family {
  _id: string;
  first_name: string;
  last_name: string;
  first_name_alt: string;
  last_name_alt: string;
  time: string;
  students: Array<Student>;
  email?: string; //for family survey
}
