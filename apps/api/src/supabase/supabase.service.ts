import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      this.logger.error('Supabase URL or Service Role Key is missing');
      throw new Error('Supabase configuration is incomplete');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      this.logger.error('Supabase sign up error', error);
      throw new UnauthorizedException('Sign up failed');
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      if (error) throw error;

      return data;
    } catch (error) {
      this.logger.error('Supabase sign in error', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async signOut(accessToken: string) {
    try {
      const { error } = await this.supabaseClient.auth.signOut();

      if (error) throw error;

      return true;
    } catch (error) {
      this.logger.error('Supabase sign out error', error);
      throw new UnauthorizedException('Logout failed');
    }
  }

  async verifyToken(token: string) {
    try {
      const { data, error } = await this.supabaseClient.auth.getUser(token);

      if (error) throw error;

      return data.user;
    } catch (error) {
      this.logger.error('Supabase token verification error', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }
}
