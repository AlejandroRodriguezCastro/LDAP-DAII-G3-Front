export interface JWTStructure {
  aud: string;
  azp: string;
  email: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  roles: string[];
  scope: string[];
  sub: string;
  typ: string;
}
