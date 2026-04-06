import { Student } from './student';

export interface Family {
  _id: string;
  name: string;
  time: string;
  students: Array<Student>;
  email?: string; //for family survey
}
