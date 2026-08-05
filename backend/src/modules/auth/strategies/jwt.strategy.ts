import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly supabase: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret', // In production, require env var
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const { data: user, error } = await this.supabase.getClient()
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      throw new UnauthorizedException();
    }

    // Return the user object, which is injected into Request
    return user;
  }
}
