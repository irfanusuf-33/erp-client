



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
