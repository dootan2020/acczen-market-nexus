
export interface UserToken {
  id: string;
  user_id: string;
  name: string;
  token: string;
  description?: string;
  expires_at?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface UserTokenResponse {
  token: UserToken;
}

export interface UserTokensResponse {
  tokens: UserToken[];
}
