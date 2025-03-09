export type Specialties = string[];

export type Advocate = {
  id: string;
  firstName: string;
  lastName: string;
  degree: string;
  yearsOfExperience: number;
  specialties: Specialties;
  city: string;
  phoneNumber: string;
};
