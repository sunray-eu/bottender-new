export type Platform =
  | 'messenger'
  | 'whatsapp'
  | 'line'
  | 'slack'
  | 'telegram'
  | 'viber';
export type Session = 'memory' | 'file' | 'redis' | 'mongo';
export type Answer = {
  name: string;
  platforms: Platform[];
  session: Session;
};

export interface ErrorResponse {
  response?: {
    status?: string;
    data?: string;
  };
  message?: string;
}
