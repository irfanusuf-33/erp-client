


export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  tenantId: string;
  policies: string[];
  lastLogin?: string;
  department ? : any
}





// dtos 

export interface LoginRequest {
  tenantId: string;
  email: string;
  pwd: string;
  rememberMe?: boolean;
}



export interface LoginResponse {
  success: boolean;
  msg?: string;
  user?: any;
  status?: string;
  mfaSession?: string;
  redirectUrl?: string;
  token ? : string
  
}
