export interface Role {
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  organization: string;
}

export interface User {
  username: string;
  mail: string;
  roles: Role[];
  id: string;
  uidNumber: number;
  gidNumber: number;
  is_active: boolean;
  telephone_number: string;
  postalAddress: string;
  address: string;
  first_name: string;
  last_name: string;
  dnPath: string;
  organization: string;
  created_at: string;
  updated_at: string;
  password: string;
}
